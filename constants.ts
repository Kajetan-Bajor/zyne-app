import { StarterPrompt } from "./types";

// Configuration Logic
// API Keys and Workflow IDs have been removed as requested.

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: '1',
    title: 'Poznaj Architekturę',
    subtitle: 'Zobacz, jak działa Hybrydowy Agent AI i\u00A0z\u00A0czego się składa.',
    prompt: 'Opisz szczegółowo architekturę Hybrydowego Agenta AI. Z jakich komponentów się składa i jak one ze sobą współpracują?'
  },
  {
    id: '2',
    title: 'Odkryj Możliwości',
    subtitle: 'Sprawdź, które procesy agent automatyzuje w\u00A0Twojej firmie.',
    prompt: 'Wymień i opisz procesy biznesowe, które mogą zostać zautomatyzowane dzięki wdrożeniu agenta AI w mojej firmie.'
  },
  {
    id: '3',
    title: 'Przykłady Działań',
    subtitle: 'Zobacz krótkie przykłady użycia agentów w praktyce.',
    prompt: 'Podaj konkretne, praktyczne przykłady użycia agentów AI (use-cases) w różnych branżach.'
  },
  {
    id: '4',
    title: 'Sprawdź Integracje',
    subtitle: 'Poznaj sposób łączenia agentów z narzędziami i systemami firmy.',
    prompt: 'Jak wygląda proces integracji agentów AI z zewnętrznymi narzędziami i systemami firmowymi (CRM, ERP, Slack, itp.)?'
  }
];

export const MOCK_HISTORY = [
  { id: 'h1', title: 'Pomoc z React', updatedAt: Date.now() - 100000 },
  { id: 'h2', title: 'Strategia Marketingowa', updatedAt: Date.now() - 200000 },
  { id: 'h3', title: 'Przegląd Kodu', updatedAt: Date.now() - 500000 },
];