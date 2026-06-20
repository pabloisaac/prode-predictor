import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { runSimulation } from '@/lib/poisson';
import { ANALYST_SYSTEM_PROMPT } from '@/lib/prompts';
import { MatchInput, SimulationResponse } from '@/types/simulation';

const client = new Anthropic();

// Simple in-memory rate limiting: 1 request per IP per 30 seconds
const rateLimitMap = new Map<string, number>();

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip) ?? 0;

  if (now - lastRequest < 30_000) {
    const retryAfter = Math.ceil((30_000 - (now - lastRequest)) / 1000);
    return NextResponse.json(
      { error: `Rate limit: esperá ${retryAfter} segundos antes de otra simulación.` },
      { status: 429 }
    );
  }
  rateLimitMap.set(ip, now);

  let body: MatchInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  const { homeTeam, awayTeam, phase, tacticalContext } = body;
  if (!homeTeam || !awayTeam) {
    return NextResponse.json({ error: 'Faltan equipos.' }, { status: 400 });
  }

  const userMessage = `Analizá el siguiente partido del Mundial 2026:

Equipo local: ${homeTeam}
Equipo visitante: ${awayTeam}
Fase: ${phase || 'Fase de grupos'}
Contexto táctico adicional: ${tacticalContext || 'Sin información adicional'}

Buscá datos reales en internet, calibrá el modelo y devolvé el JSON requerido.`;

  try {
    const response = await client.messages.create(
      {
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        system: ANALYST_SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 } as never],
        messages: [{ role: 'user', content: userMessage }],
      },
      { timeout: 90_000 }
    );

    // Extract text content from response (last text block)
    let rawText = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        rawText = block.text;
      }
    }

    // Parse JSON from Claude's response
    let claudeData: {
      lamHome: number;
      lamAway: number;
      lamHomeRange?: [number, number];
      lamAwayRange?: [number, number];
      rho: number;
      reasoning: string;
      sources: string[];
      context: string;
      confidence: 'ALTA' | 'MEDIA' | 'BAJA';
      confidenceReason: string;
      recommendation: string;
      aiPicks?: Array<{ score?: string; reason?: string }>;
      warnings: string[];
      marketComparison: {
        homeWin?: number | null;
        draw?: number | null;
        awayWin?: number | null;
        source?: string | null;
      };
    };

    try {
      // Try to extract JSON from text (Claude might wrap it in ```json blocks)
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) ??
        rawText.match(/```\s*([\s\S]*?)\s*```/) ??
        rawText.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim();
      claudeData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          error: 'Claude no pudo generar el análisis en formato correcto. Intentá de nuevo.',
          raw: rawText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    // Validate and clamp values
    const lamHome = Math.max(0.1, Math.min(5, Number(claudeData.lamHome) || 1.2));
    const lamAway = Math.max(0.1, Math.min(5, Number(claudeData.lamAway) || 1.0));
    const rho = Math.max(-0.08, Math.min(-0.03, Number(claudeData.rho) || -0.05));

    // Build a sane goals range around each point estimate. Defaults to ±18% if
    // Claude didn't provide one or returned something malformed.
    const buildRange = (
      raw: [number, number] | undefined,
      mid: number
    ): [number, number] => {
      let lo = Array.isArray(raw) ? Number(raw[0]) : NaN;
      let hi = Array.isArray(raw) ? Number(raw[1]) : NaN;
      if (isNaN(lo) || isNaN(hi) || lo > hi) {
        lo = mid * 0.82;
        hi = mid * 1.18;
      }
      // Always keep the point estimate inside the range and clamp to valid xG.
      lo = Math.max(0.05, Math.min(lo, mid));
      hi = Math.min(6, Math.max(hi, mid));
      return [lo, hi];
    };
    const lamHomeRange = buildRange(claudeData.lamHomeRange, lamHome);
    const lamAwayRange = buildRange(claudeData.lamAwayRange, lamAway);

    // Normalize market probabilities: Claude sometimes returns them as
    // percentages (61.9) instead of fractions (0.619). Coerce to 0-1.
    const normProb = (v: number | null | undefined): number | undefined => {
      if (v == null || isNaN(Number(v))) return undefined;
      let n = Number(v);
      if (n > 1) n = n / 100;
      return Math.max(0, Math.min(1, n));
    };

    const simulation = runSimulation(lamHome, lamAway, rho, {
      lamHomeRange,
      lamAwayRange,
      simulations: 300_000,
    });

    const result: SimulationResponse = {
      match: {
        home: homeTeam,
        away: awayTeam,
        phase: phase || 'Fase de grupos',
      },
      calibration: {
        lamHome,
        lamAway,
        lamHomeRange,
        lamAwayRange,
        rho,
        reasoning: claudeData.reasoning ?? '',
        sources: Array.isArray(claudeData.sources) ? claudeData.sources : [],
      },
      simulation,
      narrative: {
        context: claudeData.context ?? '',
        confidence: claudeData.confidence ?? 'BAJA',
        confidenceReason: claudeData.confidenceReason ?? '',
        recommendation: claudeData.recommendation ?? '',
        aiPicks: Array.isArray(claudeData.aiPicks)
          ? claudeData.aiPicks
              .map((p) => {
                // Normalize score to "H-A" with single-digit goals
                const m = String(p?.score ?? '').match(/(\d+)\s*[-:aA]\s*(\d+)/);
                if (!m) return null;
                return {
                  score: `${m[1]}-${m[2]}`,
                  reason: String(p?.reason ?? '').slice(0, 200),
                };
              })
              .filter((p): p is { score: string; reason: string } => p !== null)
              .slice(0, 3)
          : [],
        warnings: Array.isArray(claudeData.warnings) ? claudeData.warnings : [],
      },
      marketComparison: {
        homeWin: normProb(claudeData.marketComparison?.homeWin),
        draw: normProb(claudeData.marketComparison?.draw),
        awayWin: normProb(claudeData.marketComparison?.awayWin),
        source: claudeData.marketComparison?.source ?? undefined,
      },
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    if (message.includes('timeout') || message.includes('timed out')) {
      return NextResponse.json(
        { error: 'La búsqueda tardó demasiado. Intentá de nuevo.' },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: `Error al analizar: ${message}` }, { status: 500 });
  }
}
