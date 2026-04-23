# The Daily Reflection Tree: Design Rationale

This document explains the design choices for the Reflection Tree built for the DT Fellowship Assignment. The objective was to create a structured, deterministic tool to guide an employee through end-of-day reflection across three psychological axes: Locus of Control, Orientation, and Radius.

## 1. Structure & Flow

The conversation flows sequentially through the three axes, building insight cumulatively:
1. **Locus (Axis 1):** First, we determine if the employee feels they acted with agency or were victims of circumstance.
2. **Orientation (Axis 2):** Next, we explore whether they entered interactions seeking to give or expecting to receive.
3. **Radius (Axis 3):** Finally, we assess whether their perspective is constrained to their own needs or widened to include the collective.

A vital design decision was not to treat these axes as isolated quizzes, but as a continuous narrative. Bridges (`BRIDGE_1_2`, `BRIDGE_2_3`) seamlessly connect the topics. The tone is deliberate: a wise colleague, not a clinical survey or a reprimanding manager.

## 2. Question Design & Psychology

The questions had to avoid leading the user to "obvious" correct answers. If the options feel contrived, the user won't reflect honestly.

### Axis 1: Locus (Victim vs. Victor)
Drawing on Julian Rotter's Locus of Control, I split the opening question (`A1_OPEN`) to contextualize the follow-ups. If a user had a "High and positive" day, their locus is evaluated differently than if they had a "Low and draining" day. A good day can still be external ("I got lucky"), and a bad day can still be internal ("I pivoted"). This nuance captures the reality that agency isn't just about winning; it's about owning the response.

### Axis 2: Orientation (Contribution vs. Entitlement)
Based on Campbell's Psychological Entitlement, the questions here focus on *transactions* (e.g., tasks outside of a role). Entitlement thrives when an employee calculates what they are owed. By asking "If someone asked you to do a task slightly outside your role today...", the options expose whether the baseline is "giving value" or "protecting boundaries."

### Axis 3: Radius (Self vs. Altrocentrism)
Drawing from Maslow's Self-Transcendence, these questions force the employee to define the "main character" of their day. When friction occurs, the most natural human instinct is self-centrism. The options range from completely ignoring the other's context ("my needs were more pressing") to proactive empathy ("I stepped into their shoes").

## 3. The Mechanics of Determinism

The tree relies heavily on `decision` nodes that act as silent routers.
- The state tracks variables as users make choices (e.g., `axis1:internal += 1`).
- The `decision` nodes use basic conditional logic (e.g., `signals.axis1.internal >= signals.axis1.external`) to pick the appropriate reflection.
- The `summary` nodes combine all three axes to provide a hyper-tailored sign-off without ever calling an LLM.

## 4. What I Would Improve

If given more time:
1. **More Complex State Interactions:** I would allow Axis 2 questions to reference the specific type of agency established in Axis 1 (e.g., "Because you felt overwhelmed today, were your interactions more defensive?").
2. **Larger Vocabulary for Interpolation:** Currently, we interpolate `{A1_OPEN.answer}` directly. A more sophisticated tree might have a map of "display strings" so an answer of "Chaotic and reactive" could interpolate seamlessly into sentences like "You mentioned the day felt chaotic...".
3. **Deeper Branching:** I would add sub-branches for specific combinations (e.g., what if someone has high internal agency but extreme self-centrism? That's the profile of a brilliant jerk, and the reflection could be tailored to address that specific archetype).
