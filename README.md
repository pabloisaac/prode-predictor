<div align="center">

<img src="assets/logo.svg" alt="Mundial 2026 Predictor" width="420" />

<br/>

**Simulador de partidos del Mundial FIFA 2026 con IA y estadística avanzada**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Claude AI](https://img.shields.io/badge/Claude-Anthropic-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

![Grupos](https://img.shields.io/badge/Grupos-12%20grupos%20·%2048%20equipos-00E676?style=flat-square)
![MonteCarlo](https://img.shields.io/badge/Simulación-300.000%20iteraciones-00C853?style=flat-square)
![DixonColes](https://img.shields.io/badge/Modelo-Dixon--Coles%20·%20Poisson-00BCD4?style=flat-square)
![WebSearch](https://img.shields.io/badge/Datos-Web%20Search%20en%20tiempo%20real-7C4DFF?style=flat-square)

</div>

---

## Descripción

Mundial 2026 Predictor es una app web que combina simulación estadística con búsqueda de datos en tiempo real para predecir resultados de partidos del Mundial FIFA 2026. Usa el modelo Dixon-Coles con distribución de Poisson bivariada para estimar goles esperados (xG), calibrado con información actual que Claude busca en la web antes de cada simulación. Corre 300.000 iteraciones Monte Carlo por partido y presenta los resultados con probabilidades, mercados de apuestas y análisis narrativo.

---

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Selección de equipos** | Dropdowns con los 48 equipos oficiales del Mundial 2026, organizados por grupo |
| **Fase de grupos** | Filtra enfrentamientos válidos: solo equipos del mismo grupo pueden verse las caras |
| **Fases eliminatorias** | Cualquier equipo contra cualquier equipo, con indicador de grupo de origen |
| **Búsqueda web con IA** | Claude busca datos reales (forma reciente, bajas, contexto del partido) antes de simular |
| **Simulación Monte Carlo** | 300.000 partidos simulados por consulta usando modelo Dixon-Coles + Poisson bivariado |
| **Resultados más probables** | Top scores con probabilidad individual y cobertura acumulada del top-3 |
| **Mercados de probabilidad** | Victoria local / empate / victoria visitante, ambos anotan, +2.5 goles, etc. |
| **Capas de predicción** | Resultado seguro vs. resultado probable con nivel de confianza |
| **Análisis narrativo** | Recomendación textual generada por Claude con contexto táctico |
| **Historial local** | Últimas 5 simulaciones persistidas en `localStorage`, recargables con un clic |
| **Compartir análisis** | Copia al portapapeles un resumen formateado listo para WhatsApp o redes |
| **Loading progresivo** | 4 pasos animados que reflejan el estado real del proceso |

---

## Paleta de colores

<div align="center">

![#00E676](https://img.shields.io/badge/-%2300E676-00E676?style=flat-square&label=Primary)
![#0a0a0a](https://img.shields.io/badge/-%230a0a0a-0a0a0a?style=flat-square&label=Background)
![#111111](https://img.shields.io/badge/-%23111111-111111?style=flat-square&label=Card)
![#1a1a1a](https://img.shields.io/badge/-%231a1a1a-1a1a1a?style=flat-square&label=Input)
![#333333](https://img.shields.io/badge/-%23333333-333333?style=flat-square&label=Border)
![#9E9E9E](https://img.shields.io/badge/-%239E9E9E-9E9E9E?style=flat-square&label=Text%20muted)

</div>

---

## Stack

### Frontend / Full-stack

| | Tecnología | Rol |
|---|---|---|
| ![Next.js](https://img.shields.io/badge/-Next.js-000?style=flat-square&logo=next.js) | **Next.js 16** | Framework full-stack con App Router |
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | **React 19** | UI y estado local |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | **TypeScript 5** | Tipado estático end-to-end |
| ![Tailwind](https://img.shields.io/badge/-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | **TailwindCSS 4** | Estilos utility-first |
| ![Recharts](https://img.shields.io/badge/-Recharts-22B5BF?style=flat-square) | **Recharts** | Gráficos de probabilidad |

### IA y estadística

| | Tecnología | Rol |
|---|---|---|
| ![Anthropic](https://img.shields.io/badge/-Claude%20AI-D97757?style=flat-square&logo=anthropic&logoColor=white) | **@anthropic-ai/sdk** | Búsqueda web en tiempo real + análisis narrativo |
| | **Dixon-Coles** | Modelo de predicción de goles con corrección de empates 0-0 y 1-0 |
| | **Poisson Bivariado** | Distribución de probabilidad para goles de cada equipo |
| | **Monte Carlo** | 300.000 simulaciones por partido para construir distribución de resultados |

### Infraestructura

| | Tecnología | Rol |
|---|---|---|
| ![Vercel](https://img.shields.io/badge/-Vercel-000?style=flat-square&logo=vercel) | **Vercel** | Deploy automático desde `main`, serverless functions para la API |
| ![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github&logoColor=white) | **GitHub** | Control de versiones, CI/CD via Vercel integration |

---

## Estructura del proyecto

```
mundial-2026-predictor/
├── app/
│   ├── api/
│   │   └── simulate/
│   │       └── route.ts         # API route: llama a Claude + corre simulación
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # UI principal: form, loading, resultados, historial
├── components/
│   ├── MatchForm.tsx            # Selección de equipos, grupo y fase con validación
│   ├── SimulationResults.tsx    # Vista completa de resultados
│   ├── ProbabilityChart.tsx     # Gráfico de barras con top resultados
│   ├── ScoresGrid.tsx           # Grilla de scores más probables
│   ├── MarketsTable.tsx         # Tabla de mercados (1X2, BTTS, +2.5, etc.)
│   └── ConfidenceBadge.tsx      # Badge de nivel de confianza
├── lib/
│   ├── grupos.ts                # 48 equipos organizados en 12 grupos (A-L)
│   ├── poisson.ts               # Implementación Dixon-Coles + Monte Carlo
│   ├── prompts.ts               # Prompts para Claude (búsqueda + análisis)
│   └── insights.ts              # Capas de predicción y lógica narrativa
├── types/
│   └── simulation.ts            # Tipos TypeScript compartidos
├── assets/
│   └── logo.svg
└── public/
```

---

## Modelo estadístico

El predictor usa el modelo **Dixon-Coles** (1997) con las siguientes etapas:

```
1. Claude busca en la web
   └── forma reciente, lesiones, estadísticas head-to-head, contexto de fase

2. Calibración de parámetros xG
   └── λ (goles esperados local) y μ (goles esperados visitante)
   └── ajustados por ventaja de local y contexto táctico ingresado

3. Distribución Poisson Bivariada
   └── P(X=i, Y=j) con corrección Dixon-Coles para (0,0) y (1,0)
   └── elimina la subestimación de empates bajos en Poisson independiente

4. Simulación Monte Carlo (300.000 iteraciones)
   └── construye distribución empírica de todos los scorelines posibles
   └── agrega resultados en mercados: 1X2, BTTS, O/U 2.5, etc.

5. Análisis narrativo
   └── Claude interpreta los números con contexto y genera recomendación
```

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API key de Anthropic (Claude) — requerida |

---

## Desarrollo local

### Requisitos

![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-o%20pnpm-CB3837?style=flat-square&logo=npm&logoColor=white)

### 1. Clonar e instalar
```bash
git clone https://github.com/pabloisaac/prode-predictor.git
cd prode-predictor
npm install
```

### 2. Variables de entorno
```bash
# Crear .env.local y agregar:
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Iniciar en modo desarrollo
```bash
npm run dev
# App: http://localhost:3000
```

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con hot reload
npm run build     # Build de producción
npm run start     # Servidor de producción local
```

---

## Grupos del Mundial 2026

Los 48 equipos distribuidos en 12 grupos:

| Grupo | Equipos |
|-------|---------|
| **A** | México · Sudáfrica · Corea del Sur · República Checa |
| **B** | Canadá · Bosnia y Herzegovina · Catar · Suiza |
| **C** | Brasil · Marruecos · Haití · Escocia |
| **D** | Estados Unidos · Paraguay · Australia · Turquía |
| **E** | Alemania · Curazao · Costa de Marfil · Ecuador |
| **F** | Países Bajos · Japón · Suecia · Túnez |
| **G** | Bélgica · Egipto · Irán · Nueva Zelanda |
| **H** | España · Cabo Verde · Arabia Saudita · Uruguay |
| **I** | Francia · Senegal · Irak · Noruega |
| **J** | Argentina · Argelia · Austria · Jordania |
| **K** | Portugal · Rep. Dem. del Congo · Uzbekistán · Colombia |
| **L** | Inglaterra · Croacia · Ghana · Panamá |

---

<div align="center">

<img src="assets/logo.svg" alt="Mundial 2026 Predictor" width="260" />

<br/>

*Desarrollado con ♥ para el **Mundial FIFA 2026***

</div>
