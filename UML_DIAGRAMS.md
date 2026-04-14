# ImmigrationIQ UML Diagrams

## 1. Use Case Diagram
```mermaid
flowchart LR
  U[User]
  A[Admin Optional Future]
  Home[Home Module]
  Planner[Planner Module]
  Learn[Learning Hub]
  Safety[Safety Module]
  Dashboard[Dashboard Module]
  Countries[Country Guides]
  Glossary[Glossary Modal]

  U --> Home
  U --> Planner
  U --> Learn
  U --> Safety
  U --> Dashboard
  U --> Countries
  U --> Glossary

  A --> Safety
  A --> Learn
```

## 2. Sequence Diagram (Planner to Generated Plan)
```mermaid
sequenceDiagram
  participant User
  participant UI as Planner UI
  participant Data as PLAN_DATA
  participant Result as Plan Result View

  User->>UI: Enter personal and immigration details
  UI->>Data: Fetch visa types for destination
  Data-->>UI: Visa options
  User->>UI: Complete preferences and click Generate
  UI->>Data: Fetch docs, timeline, rules, costs, culture, emergency, citySafety
  Data-->>UI: Structured plan payload
  UI->>Result: Render generated plan cards and heatmap
  Result-->>User: Personalized plan output
```

## 3. Activity Diagram (End-to-End User Flow)
```mermaid
flowchart TD
  Start([Start]) --> H[Open Home]
  H --> P[Go to Planner]
  P --> F1[Fill Step 1 Personal]
  F1 --> F2[Fill Step 2 Immigration]
  F2 --> F3[Fill Step 3 Preferences]
  F3 --> G[Generate Plan]
  G --> R[Review Timeline Rules Costs Heatmap]
  R --> L[Open Learn]
  L --> LS[Check Legal Rule Snapshot]
  LS --> M[Complete Lessons and Quiz]
  M --> S[Open Safety and Scam Feed]
  S --> D[Track Progress in Dashboard]
  D --> End([End])
```

## 4. Class Diagram (Frontend Logical Model)
```mermaid
classDiagram
  class UserProfile {
    +name
    +passportCountry
    +email
    +destination
    +purpose
    +visaType
    +moveDate
    +duration
    +language
  }

  class PlannerEngine {
    +populateVisaOptions(destination)
    +generatePlan(profile)
    +renderCityHeatmap(destination)
  }

  class PlanDataStore {
    +visaTypes
    +docs
    +timeline
    +rules
    +costs
    +culture
    +emergency
    +citySafety
    +flags
  }

  class LearningModule {
    +id
    +title
    +category
    +difficulty
    +duration
    +progress
    +lessons
    +quiz
  }

  class LegalSnapshot {
    +country
    +riskLevel
    +title
    +description
  }

  class Simulator72h {
    +steps
    +stateIndex
    +legalScore
    +safetyScore
    +riskScore
    +pickChoice()
    +nextStep()
    +reset()
  }

  class ScamAlert {
    +title
    +region
    +channel
    +risk
    +time
  }

  UserProfile --> PlannerEngine : input
  PlannerEngine --> PlanDataStore : reads
  LearningModule --> LegalSnapshot : contextual legal rules
  Dashboard --> Simulator72h : contains
  Safety --> ScamAlert : lists
```

## 5. Component Diagram (System Design)
```mermaid
flowchart TB
  subgraph Client Browser
    Home[Home Page]
    Planner[Planner Page]
    Learn[Learn Page]
    Safety[Safety Page]
    Dashboard[Dashboard Page]
    SharedUI[Shared CSS and Shared JS]
    LocalStore[Local Storage Auth and State]
  end

  Home --- SharedUI
  Planner --- SharedUI
  Learn --- SharedUI
  Safety --- SharedUI
  Dashboard --- SharedUI

  Dashboard --- LocalStore
  Planner --- LocalStore
  Learn --- LocalStore
```

## 6. State Diagram (Planner Form and Result)
```mermaid
stateDiagram-v2
  [*] --> Step1
  Step1 --> Step2: Continue
  Step2 --> Step1: Back
  Step2 --> Step3: Continue
  Step3 --> Step2: Back
  Step3 --> Generated: Generate Plan
  Generated --> Generated: Export or Print or Save
  Generated --> Step1: Edit Inputs
  Generated --> [*]
```

## 7. Deployment Diagram (Current + Future)
```mermaid
flowchart LR
  Dev[Developer Machine]
  Browser[User Browser]
  StaticHost[Static Hosting: Netlify or Vercel or GitHub Pages]
  LocalData[Local Storage]
  FutureAPI[Future Backend API]
  FutureDB[Future Database]

  Dev --> StaticHost
  Browser --> StaticHost
  Browser --> LocalData
  Browser -. future integration .-> FutureAPI
  FutureAPI --> FutureDB
```

## 8. Deliverable Note
- This file can be rendered with Mermaid support in Markdown preview.
- You can export it to PDF using VS Code Markdown print/export extensions or browser print to PDF.
