// ============================================================================
// OR STUDY PLATFORM - COMPLETE TD & FINAL EXAM EXERCISE BANK (ENGLISH EDITION)
// Covers TD1, TD2, TD3, Sheet No. 4 (B&B), and Final Exam (Univ. Oran 1)
// ============================================================================

window.OR_EXERCISES = [
  // ==========================================================================
  // TD 1: LP FORMULATION & 2D GRAPHICAL RESOLUTION
  // ==========================================================================
  {
    id: "td1-ex1",
    sheet: "TD1",
    badge: "TD1 - Ex 1",
    title: "2D Graphical Study of the 7 Linear Systems (Z₁ to Z₇)",
    topic: "Graphical Method & Special Cases",
    difficulty: "Fundamental",
    examPriority: "HIGH",
    statement: `Solve the following linear systems graphically when seeking to **maximize** and then **minimize** the objective function $Z_i$ subject to constraints $C_i$ (with $x_1, x_2 \\ge 0$):

1. **$Z_1 = 3x_1 + 2x_2$** subject to $C_1 : \\begin{cases} 2x_1 + x_2 \\le 5 \\\\ x_1 + 2x_2 \\le 4 \\end{cases}$
2. **$Z_2 = x_1 + 2x_2$** subject to $C_2 : \\begin{cases} x_1 + 2x_2 \\le 10 \\\\ x_1 + x_2 \\le 6 \\\\ 2x_1 + x_2 \\le 10 \\end{cases}$
3. **$Z_3 = 2x_1 + 3x_2$** subject to $C_3 : \\begin{cases} x_1 + x_2 \\ge 1 \\\\ x_1 - x_2 \\ge 0 \\\\ x_1 + 3x_2 \\le 6 \\end{cases}$
4. **$Z_4 = x_1 + 2x_2$** subject to $C_4 : \\begin{cases} -x_1 + 2x_2 \\le 2 \\\\ x_1 + x_2 \\le 4 \\\\ x_1 \\le 3 \\end{cases}$
5. **$Z_5 = 2x_1 - x_2$** subject to $C_5 : \\begin{cases} x_1 - x_2 \\le 1 \\\\ -x_1 + 2x_2 \\le 4 \\end{cases}$
6. **$Z_6 = -x_1 + 2x_2$** subject to $C_6 : \\begin{cases} x_1 - 2x_2 \\le 2 \\\\ x_1 - x_2 \\le -2 \\end{cases}$
7. **$Z_7 = 3x_1 - 2x_2$** subject to $C_7 : \\begin{cases} x_1 + x_2 \\le 2 \\\\ 2x_1 + 2x_2 \\ge 8 \\end{cases}$`,
    hint: "Plot the boundary lines for each system, find all feasible corner vertices in the first quadrant ($x_1, x_2 \\ge 0$), and evaluate $Z_i$ at each vertex. Watch out for objective lines parallel to constraints ($Z_2$), unbounded regions ($Z_5, Z_6$), and empty feasible sets ($Z_7$)!",
    solution: `### Complete Step-by-Step Solution for All 7 Systems

#### 1. System $(Z_1, C_1)$: Unique Optimal Vertex
- **Feasible Polygon Vertices**: $O(0,0)$, $A(2.5, 0)$, $B(2, 1)$ (intersection of $2x_1+x_2=5$ and $x_1+2x_2=4$), and $C(0, 2)$.
- **Evaluating $Z_1 = 3x_1 + 2x_2$**:
  - $Z_1(O) = 0$ (**Minimum** $= 0$)
  - $Z_1(A) = 3(2.5) + 0 = 7.5$
  - $Z_1(B) = 3(2) + 2(1) = \\mathbf{8}$ (**Unique Maximum** at $(2, 1)$)
  - $Z_1(C) = 0 + 2(2) = 4$

#### 2. System $(Z_2, C_2)$: Multiple Optimal Solutions (Optimal Edge)
- **Vertices**: $O(0,0)$, $A(5,0)$, $B(4,2)$, $C(2,4)$, $D(0,5)$.
- The objective function $Z_2 = x_1 + 2x_2$ has the **exact same slope** as the first constraint $x_1 + 2x_2 \\le 10$!
- **Maximum**: $Z_2^* = \\mathbf{10}$, attained along the **entire edge $[C(2,4), D(0,5)]$** (infinitely many optimal solutions).
- **Minimum**: $Z_2^* = 0$ at $O(0,0)$.

#### 3. System $(Z_3, C_3)$: Bounded Polygon Excluding the Origin
- Constraint $x_1 - x_2 \\ge 0 \\iff x_2 \\le x_1$ keeps points below the line $x_2 = x_1$.
- **Feasible Vertices**: $A(1, 0)$, $B(6, 0)$, $C(1.5, 1.5)$ (intersection of $x_1=x_2$ and $x_1+3x_2=6$), $D(0.5, 0.5)$ (intersection of $x_1=x_2$ and $x_1+x_2=1$).
- **Maximum of $Z_3 = 2x_1 + 3x_2$**: Attained at $B(6, 0)$ with $Z_3^* = 2(6) + 0 = \\mathbf{12}$ (versus $7.5$ at $C(1.5, 1.5)$).
- **Minimum of $Z_3$**: Attained at $A(1, 0)$ with $Z_3^* = \\mathbf{2}$ (versus $2.5$ at $D(0.5, 0.5)$).

#### 4. System $(Z_4, C_4)$: Bounded Polygon
- **Vertices**: $O(0,0)$, $A(3,0)$, $B(3, 1)$, $C(2, 2)$ (intersection of $-x_1+2x_2=2$ and $x_1+x_2=4$), $D(0, 1)$.
- **Maximum of $Z_4 = x_1 + 2x_2$**: $Z_4(C(2,2)) = 2 + 4 = \\mathbf{6}$ (**Unique Maximum** at $(2,2)$).
- **Minimum**: $Z_4(O) = 0$.

#### 5. System $(Z_5, C_5)$: Unbounded Feasible Region
- The region is an open corridor extending to $x_1, x_2 \\to +\\infty$ between $x_2 = x_1 - 1$ and $x_2 = 0.5x_1 + 2$.
- **Maximum of $Z_5 = 2x_1 - x_2$**: Moving along $x_2 = 0.5x_1 + 2$ gives $Z_5 = 1.5x_1 - 2 \\to \\mathbf{+\\infty}$ (**Unbounded**!).
- **Minimum of $Z_5$**: Attained at vertex $C(0, 2)$ with $Z_5^* = 2(0) - 2 = \\mathbf{-2}$.

#### 6. System $(Z_6, C_6)$: Unbounded Region Above $x_2 = x_1 + 2$
- Constraint $x_1 - x_2 \\le -2 \\iff x_2 \\ge x_1 + 2$. The region is unbounded upward ($x_2 \\to +\\infty$).
- **Maximum of $Z_6 = -x_1 + 2x_2$**: **$+\\infty$ (Unbounded)**.
- **Minimum of $Z_6$**: Along $x_2 = x_1 + 2$, $Z_6 = -x_1 + 2(x_1 + 2) = x_1 + 4$, minimized at $(0, 2)$ with **$Z_6^* = 4$**.

#### 7. System $(Z_7, C_7)$: Empty Feasible Region (Infeasible)
- Requires $x_1 + x_2 \\le 2$ and $2x_1 + 2x_2 \\ge 8 \\iff x_1 + x_2 \\ge 4$ simultaneously.
- Impossible! **$\\mathcal{D} = \\emptyset$ (Infeasible)**.`,
    solverPreset: {
      solverType: "graphical",
      data: {
        type: "max",
        c: [3, 2],
        constraints: [
          { a1: 2, a2: 1, op: "<=", b: 5 },
          { a1: 1, a2: 2, op: "<=", b: 4 }
        ]
      }
    }
  },
  {
    id: "td1-ex2",
    sheet: "TD1",
    badge: "TD1 - Ex 2",
    title: "Automobile Manufacturer, Graphical Sensitivity & Competitor Buyout (Dual)",
    topic: "Modeling, Graphical Method, Shadow Prices & Duality",
    difficulty: "Exam Classic",
    examPriority: "HIGH",
    statement: `An automobile manufacturer produces 2 types of vehicles: **small cars ($x_1$)** and **large cars ($x_2$)**.
- **Unit profits**: $\\$10,000$ per small car, $\\$16,000$ per large car.
- **Resource consumption per car**:
  - Small car: $1$ unit of rubber and $2$ units of steel.
  - Large car: $2$ units of rubber and $2$ units of steel.
- **Available stock**: $400$ units of rubber and $600$ units of steel.

**Questions:**
1. Formulate the LP and determine graphically the optimal production plan $(x_1^*, x_2^*)$ and maximum profit $Z^*$.
2. How much does optimal profit increase if steel stock rises from $600$ to $700$ units? And from $700$ to $800$ units?
3. Same question if rubber stock rises from $400$ to $500$, then to $600$ units (keeping steel at $600$).
4. A competitor offers to buy out the raw stocks at unit prices $u$ (rubber) and $v$ (steel). Formulate the competitor's problem (Dual), solve it, and compare with Questions 2 and 3.`,
    hint: "1) Solve $x_1 + 2x_2 \\le 400$ and $2x_1 + 2x_2 \\le 600$. 2) Shift the steel line ($x_1+x_2 = 300 \\to 350 \\to 400$) and find the new intersection! 4) The competitor's prices $(u^*, v^*)$ are the exact Shadow Prices of rubber and steel!",
    solution: `### Complete Step-by-Step Solution (TD1 - Exercise 2)

#### 1. LP Formulation & Graphical Solution
Let $x_1 \\ge 0$ be the number of small cars and $x_2 \\ge 0$ the number of large cars:
$$\\max Z = 10,000 x_1 + 16,000 x_2 \\quad \\text{s.t.} \\quad \\begin{cases} x_1 + 2x_2 \\le 400 & (\\text{Rubber}) \\\\ 2x_1 + 2x_2 \\le 600 & (\\text{Steel}) \\\\ x_1, x_2 \\ge 0 \\end{cases}$$
- **Feasible Corner Vertices**:
  - $O(0,0) \\implies Z = 0$
  - $A(300, 0) \\implies Z = \\$3,000,000$
  - $B(200, 100)$ (intersection of both constraints) $\\implies Z = 10,000(200) + 16,000(100) = \\mathbf{\\$3,600,000}$ (**OPTIMUM**)
  - $C(0, 200) \\implies Z = \\$3,200,000$.
- **Conclusion**: Produce **$200$ small cars** and **$100$ large cars** for a maximum profit of **$\\$3,600,000$**.

---

#### 2. Sensitivity to Steel Stock ($600 \\to 700 \\to 800$, with Rubber $= 400$)
- **From $600$ to $700$ steel** ($2x_1 + 2x_2 \\le 700 \\iff x_1 + x_2 \\le 350$):
  - Intersection with $x_1 + 2x_2 = 400$ moves to $(x_1, x_2) = (300, 50) \\ge 0$.
  - New profit: $Z = 10,000(300) + 16,000(50) = \\$3,800,000$.
  - **Profit gain**: **$+\\$200,000$** (i.e., **$\\$2,000$ per extra unit of steel**!).
- **From $700$ to $800$ steel** ($x_1 + x_2 \\le 400$):
  - Intersection moves to $(400, 0)$: $Z = \\$4,000,000$ (another **$+\\$200,000$**). Beyond $800$ steel, rubber ($400$) becomes a bottleneck so extra steel adds $\\$0$.

---

#### 3. Sensitivity to Rubber Stock ($400 \\to 500 \\to 600$, with Steel $= 600$)
- **From $400$ to $500$ rubber** ($x_1 + 2x_2 \\le 500$ and $x_1 + x_2 \\le 300$):
  - Intersection moves to $(100, 200) \\ge 0 \\implies Z = \\$4,200,000$ (**$+\\$600,000$**, or **$\\$6,000$ per unit of rubber**!).
- **From $500$ to $600$ rubber**:
  - Intersection moves to $(0, 300) \\implies Z = \\$4,800,000$ (another **$+\\$600,000$**).

---

#### 4. Competitor's Buyout Problem (Dual LP)
Let $u \\ge 0$ be the unit buyout price for rubber and $v \\ge 0$ for steel:
$$\\min W = 400 u + 600 v \\quad \\text{s.t.} \\quad \\begin{cases} 1 u + 2 v \\ge 10,000 & (\\text{Small car}) \\\\ 2 u + 2 v \\ge 16,000 & (\\text{Large car}) \\\\ u, v \\ge 0 \\end{cases}$$
Solving the tight system $\\begin{cases} u + 2v = 10,000 \\\\ 2u + 2v = 16,000 \\end{cases}$:
- **$u^* = \\$6,000$** (Shadow price of 1 unit of rubber — matches Q3!)
- **$v^* = \\$2,000$** (Shadow price of 1 unit of steel — matches Q2!)
- Minimum total buyout cost: $W^* = 400(6,000) + 600(2,000) = \\mathbf{\\$3,600,000} = Z^*$ (**Strong Duality**).`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [10000, 16000],
        constraints: [
          { a: [1, 2], op: "<=", b: 400 },
          { a: [2, 2], op: "<=", b: 600 }
        ]
      }
    }
  },

  // ==========================================================================
  // TD 2: THE SIMPLEX METHOD
  // ==========================================================================
  {
    id: "td2-ex1",
    sheet: "TD2",
    badge: "TD2 - Ex 1",
    title: "Geometric Interpretation, Enumerating Bases & Degeneracy Check",
    topic: "Bases, Extreme Points & Degeneracy",
    difficulty: "Fundamental",
    examPriority: "HIGH",
    statement: `Consider the linear program $(LP_1)$:
$$\\max F = x_1 + x_2 \\quad \\text{s.t.} \\quad \\begin{cases} x_1 + 2x_2 \\le 6 \\\\ x_1 + x_2 \\le 4 \\\\ 2x_1 + x_2 \\le 6 \\\\ x_1, x_2 \\ge 0 \\end{cases}$$
1. State the core geometric properties of the convex polyhedron and the Simplex method.
2. Convert $(LP_1)$ to standard form, compute the maximum number of bases $\\binom{n+m}{m}$, list the feasible and infeasible bases, and determine whether the problem is degenerate.`,
    hint: "With $n=2$ decision variables and $m=3$ slack variables $(e_1, e_2, e_3)$, there are $\\binom{5}{3} = 10$ ways to set 2 non-basic variables to $0$. Check what happens at $(x_1, x_2) = (2, 2)$: all 3 constraint lines pass through that single point!",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 1)

#### 1. Standard Form & Basis Enumeration
$$\\begin{cases} x_1 + 2x_2 + e_1 = 6 \\\\ x_1 + x_2 + e_2 = 4 \\\\ 2x_1 + x_2 + e_3 = 6 \\\\ x_1, x_2, e_1, e_2, e_3 \\ge 0 \\end{cases}$$
- **Maximum number of bases**: $\\binom{2+3}{3} = \\binom{5}{3} = \\mathbf{10}$ bases.
- **Degeneracy at Vertex $B(2, 2)$**:
  Plugging $(x_1, x_2) = (2, 2)$ into all 3 equations yields **$e_1 = 0, e_2 = 0, e_3 = 0$** simultaneously!
  Geometrically, all three constraint lines $x_1+2x_2=6$, $x_1+x_2=4$, and $2x_1+x_2=6$ intersect at the **exact same vertex $(2, 2)$**.
- **Therefore, the LP is DEGENERATE**: the single geometric corner $B(2,2)$ corresponds to **3 distinct feasible bases** (each having one basic slack variable equal to $0$):
  - Non-basic $(e_1=0, e_2=0) \\implies$ Basis $(x_1=2, x_2=2, e_3=0)$
  - Non-basic $(e_1=0, e_3=0) \\implies$ Basis $(x_1=2, x_2=2, e_2=0)$
  - Non-basic $(e_2=0, e_3=0) \\implies$ Basis $(x_1=2, x_2=2, e_1=0)$
- **The 4 Feasible Geometric Vertices**:
  1. $O(0, 0)$: Basis $(e_1=6, e_2=4, e_3=6) \\implies F = 0$
  2. $A(3, 0)$: Basis $(x_1=3, e_1=3, e_2=1) \\implies F = 3$
  3. $B(2, 2)$: Degenerate optimal basis $(x_1=2, x_2=2, e_k=0) \\implies F^* = \\mathbf{4}$ (**OPTIMUM**)
  4. $C(0, 3)$: Basis $(x_2=3, e_2=1, e_3=3) \\implies F = 3$.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [1, 1],
        constraints: [
          { a: [1, 2], op: "<=", b: 6 },
          { a: [1, 1], op: "<=", b: 4 },
          { a: [2, 1], op: "<=", b: 6 }
        ]
      }
    }
  },
  {
    id: "td2-ex2",
    sheet: "TD2",
    badge: "TD2 - Ex 2",
    title: "Converting to Standard Form (Lower Bounds & Unrestricted Variables)",
    topic: "Standard Form & Variable Substitutions",
    difficulty: "Fundamental",
    examPriority: "HIGH",
    statement: `Convert the following linear programs into Standard Form:
1. **$(LP_2)$**: $\\max F_2 = 6x_1 + 20x_2$ s.t. $2x_1 + 3x_2 \\le 200$, $3x_1 + 20x_2 \\le 300$, **$x_1 \\ge 8$**, **$x_2 \\ge 10$**.
2. **$(LP_3)$**: $\\max F_3 = x_1 + 2x_2$ s.t. $-x_1 + x_2 \\le 2$, $x_1 + 2x_2 \\le 8$, $2x_1 + x_2 \\le 10$, **$x_1 \\ge 0$** (**$x_2 \\in \\mathbb{R}$ unrestricted in sign!**).`,
    hint: "In $(LP_2)$, substitute $X_1 = x_1 - 8 \\ge 0$ and $X_2 = x_2 - 10 \\ge 0$ to absorb the lower bounds! In $(LP_3)$, since $x_2$ is unrestricted in sign, substitute $x_2 = x_2^+ - x_2^-$ with $x_2^+, x_2^- \\ge 0$.",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 2)

#### 1. Standard Form of $(LP_2)$ via Variable Shifting
Set $X_1 = x_1 - 8 \\ge 0 \\iff x_1 = X_1 + 8$ and $X_2 = x_2 - 10 \\ge 0 \\iff x_2 = X_2 + 10$.
- **Objective Function**:
  $$F_2 = 6(X_1 + 8) + 20(X_2 + 10) = 6X_1 + 20X_2 + 248$$
- **Constraints**:
  - $2(X_1 + 8) + 3(X_2 + 10) \\le 200 \\iff 2X_1 + 3X_2 \\le 200 - 46 = 154$
  - $3(X_1 + 8) + 20(X_2 + 10) \\le 300 \\iff 3X_1 + 20X_2 \\le 300 - 224 = 76$
- **Final Standard Form** (adding slacks $e_1, e_2 \\ge 0$):
  $$\\max F_2 = 6X_1 + 20X_2 + 248 \\quad \\text{s.t.} \\quad \\begin{cases} 2X_1 + 3X_2 + e_1 = 154 \\\\ 3X_1 + 20X_2 + e_2 = 76 \\\\ X_1, X_2, e_1, e_2 \\ge 0 \\end{cases}$$

#### 2. Standard Form of $(LP_3)$ ($x_2$ Unrestricted in Sign)
Since $x_2 \\in \\mathbb{R}$ is free in sign, we write $x_2 = x_2^+ - x_2^-$ with $x_2^+ \\ge 0, x_2^- \\ge 0$, and add slacks $e_1, e_2, e_3 \\ge 0$:
$$\\max F_3 = x_1 + 2x_2^+ - 2x_2^- \\quad \\text{s.t.} \\quad \\begin{cases} -x_1 + x_2^+ - x_2^- + e_1 = 2 \\\\ x_1 + 2x_2^+ - 2x_2^- + e_2 = 8 \\\\ 2x_1 + x_2^+ - x_2^- + e_3 = 10 \\\\ x_1, x_2^+, x_2^-, e_1, e_2, e_3 \\ge 0 \\end{cases}$$`
  },
  {
    id: "td2-ex4",
    sheet: "TD2",
    badge: "TD2 - Ex 4",
    title: "Solving LPs by the Dictionary & Tableau Methods — LP(4) & LP(5)",
    topic: "Dictionary & Tableau Simplex",
    difficulty: "Medium",
    examPriority: "HIGH",
    statement: `Solve the following linear programs using the Simplex method:
1. **$(LP_4)$**:
$$\\max F = 2x_1 + x_2 + x_3 + 3x_4 \\quad \\text{s.t.} \\quad \\begin{cases} x_1 + x_2 + 2x_3 + 3x_4 \\le 6 \\\\ 2x_2 + 3x_3 + 2x_4 \\le 4 \\\\ 2x_1 + x_2 + 2x_3 + x_4 \\le 6 \\\\ x_1, x_2, x_3, x_4 \\ge 0 \\end{cases}$$
2. **$(LP_5)$**:
$$\\max F = 30x_1 + 40x_2 + 40x_3 \\quad \\text{s.t.} \\quad \\begin{cases} 15x_1 + 30x_2 + 20x_3 \\le 1200 \\\\ 20x_1 + 5x_2 + 25x_3 \\le 1000 \\\\ 25x_1 + 10x_2 + 30x_3 \\le 1500 \\\\ x_1, x_2, x_3 \\ge 0 \\end{cases}$$`,
    hint: "For $(LP_4)$, $x_4$ enters first (largest coefficient $+3$), causing a tied minimum ratio of $2$ between $e_1$ and $e_2$. Then $x_1$ enters on iteration 2!",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 4)

#### 1. Resolution of $(LP_4)$
- **Iteration 0 (Basis $e_1=6, e_2=4, e_3=6, F=0$)**:
  - $x_4$ enters (largest coeff $+3$). Ratios: $R_1: 6/3 = 2$, $R_2: 4/2 = 2$, $R_3: 6/1 = 6$.
  - Tie for minimum ratio ($2$) between $e_1$ and $e_2$. Let $e_1$ leave:
    $$x_4 = 2 - \\frac{1}{3}x_1 - \\frac{1}{3}x_2 - \\frac{2}{3}x_3 - \\frac{1}{3}e_1$$
- **Iteration 1 (Basis $x_4=2, e_2=0, e_3=4, F=6$)**:
  - Substituting $x_4$ into $F$ gives $F = 6 + x_1 - x_3 - e_1$.
  - Only $x_1$ has a positive reduced cost ($+1$) $\\implies x_1$ enters!
  - Ratios: $x_4$-row gives $2/(1/3) = 6$; $e_2$-row has a negative coefficient $-2/3$ (skip!); $e_3$-row gives $4/(5/3) = \\mathbf{12/5 = 2.4}$. Thus $e_3$ leaves.
- **Iteration 2 (Optimal Solution)**:
  - **$x_1^* = \\frac{12}{5} = 2.4, \\quad x_4^* = \\frac{6}{5} = 1.2, \\quad x_2^* = 0, \\quad x_3^* = 0$**.
  - **Optimal Objective**: **$F^* = \\frac{42}{5} = 8.4$**.

---

#### 2. Resolution of $(LP_5)$
- Pivoting $x_2$ and $x_3$ into the basis (saturating constraints 1 and 2: $30x_2+20x_3=1200$ and $5x_2+25x_3=1000$):
  - **$x_1^* = 0, \\quad x_2^* = \\frac{200}{13} \\approx 15.38, \\quad x_3^* = \\frac{480}{13} \\approx 36.92$**.
  - **Optimal Objective**: **$F^* = \\frac{27,200}{13} \\approx 2,092.31$**.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [2, 1, 1, 3],
        constraints: [
          { a: [1, 1, 2, 3], op: "<=", b: 6 },
          { a: [0, 2, 3, 2], op: "<=", b: 4 },
          { a: [2, 1, 2, 1], op: "<=", b: 6 }
        ]
      }
    }
  },
  {
    id: "td2-ex5",
    sheet: "TD2",
    badge: "TD2 - Ex 5",
    title: "Simplex Tableaux & Post-Optimal Sensitivity Analysis (c₁ and b₂)",
    topic: "Simplex Tableaux & Sensitivity Analysis",
    difficulty: "Exam Classic",
    examPriority: "HIGH",
    statement: `Consider the linear program $(LP_6)$:
$$\\max F = 1000x_1 + 1200x_2 \\quad \\text{s.t.} \\quad \\begin{cases} 10x_1 + 5x_2 \\le 200 & (C_1) \\\\ 2x_1 + 3x_2 \\le 60 & (C_2) \\\\ x_1 \\le 18 & (C_3) \\\\ x_2 \\le 20 & (C_4) \\\\ x_1, x_2 \\ge 0 \\end{cases}$$
1. Solve $(LP_6)$ using the Simplex Tableau method.
2. Determine the stability range of the objective coefficient **$c_1$** (initially $1000$).
3. Determine the feasibility range of the right-hand side **$b_2$** of the second constraint (initially $60$).`,
    hint: "After 2 pivots ($x_2$ enters / $e_2$ leaves, then $x_1$ enters / $e_1$ leaves), the optimal basis is $(x_1=15, x_2=10, e_3=3, e_4=10)$ with $F^* = 27,000$. Use the $x_1$-row to bound $c_1$, and the $e_2$-column to bound $b_2$!",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 5)

#### 1. Simplex Tableau Resolution
Adding slacks $e_1, e_2, e_3, e_4 \\ge 0$:
- **Tableau 0**: $x_2$ enters ($c_2=1200$), $e_2$ leaves (ratio $60/3 = 20$).
- **Tableau 1**: $x_1$ enters (reduced cost $+200$), $e_1$ leaves (ratio $100 / (20/3) = 15$).
- **Tableau 2 (Optimal)**:
  - **$x_1^* = 15, \\quad x_2^* = 10, \\quad e_3^* = 3, \\quad e_4^* = 10$** ($e_1^* = e_2^* = 0$).
  - **Optimal Profit**: **$F^* = 1000(15) + 1200(10) = 27,000$**.
  - Final tableau rows in terms of non-basic $(e_1, e_2)$:
    - $x_1 + \\frac{3}{20}e_1 - \\frac{1}{4}e_2 = 15$
    - $x_2 - \\frac{1}{10}e_1 + \\frac{1}{2}e_2 = 10$
    - $e_3 - \\frac{3}{20}e_1 + \\frac{1}{4}e_2 = 3$
    - $e_4 + \\frac{1}{10}e_1 - \\frac{1}{2}e_2 = 10$
    - Final reduced costs $(c_j - z_j)$: $-30$ under $e_1$, and $-350$ under $e_2$.

---

#### 2. Stability Range for Objective Coefficient $c_1$ ($c_1 = 1000 + \\delta$)
$x_1$ is basic in row 1 (non-basic coefficients: $a_{1,e_1} = 3/20$ and $a_{1,e_2} = -1/4$).
Keeping all non-basic reduced costs $\\le 0$:
1. **Column $e_1$**: $-30 - \\delta \\left(\\frac{3}{20}\\right) \\le 0 \\iff \\delta \\ge -200$
2. **Column $e_2$**: $-350 - \\delta \\left(-\\frac{1}{4}\\right) \\le 0 \\iff \\delta \\le 1400$
- **Conclusion**: $-200 \\le \\delta \\le 1400 \\implies \\mathbf{c_1 \\in [800, \\; 2400]}$.

---

#### 3. Feasibility Range for Right-Hand Side $b_2$ ($b_2 = 60 + \\Delta$)
Column $e_2$ in the final tableau is $(-1/4, \\; 1/2, \\; 1/4, \\; -1/2)^T$.
Requiring $b^{\\text{new}} = b^{\\text{final}} + \\Delta \\cdot \\text{col}(e_2) \\ge 0$:
1. $x_1 = 15 - \\frac{1}{4}\\Delta \\ge 0 \\iff \\Delta \\le 60$
2. $x_2 = 10 + \\frac{1}{2}\\Delta \\ge 0 \\iff \\Delta \\ge -20$
3. $e_3 = 3 + \\frac{1}{4}\\Delta \\ge 0 \\iff \\Delta \\ge -12$
4. $e_4 = 10 - \\frac{1}{2}\\Delta \\ge 0 \\iff \\Delta \\le 20$
- Taking the intersection: **$-12 \\le \\Delta \\le 20 \\implies \\mathbf{b_2 \\in [48, \\; 80]}$** with shadow price **$y_2^* = 350$**.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [1000, 1200],
        constraints: [
          { a: [10, 5], op: "<=", b: 200 },
          { a: [2, 3], op: "<=", b: 60 },
          { a: [1, 0], op: "<=", b: 18 },
          { a: [0, 1], op: "<=", b: 20 }
        ]
      }
    }
  },
  {
    id: "td2-ex6",
    sheet: "TD2",
    badge: "TD2 - Ex 6",
    title: "Simplex Initialization: Big-M & Two-Phase Methods — LP(7), LP(8), LP(9)",
    topic: "Big-M Method & Artificial Variables",
    difficulty: "Advanced",
    examPriority: "HIGH",
    statement: `Solve the following linear programs using the **Big-M** (or Two-Phase) method:
1. **$(LP_7)$**: $\\max F = 2x_1 + 5x_2$ s.t. $2x_1 + x_2 \\ge 6$, $-x_1 - x_2 \\ge -8$, $x_2 \\le 2$, $x_1, x_2 \\ge 0$.
2. **$(LP_8)$**: $\\min F = 195x_1 + 160x_2 + 120x_3$ s.t. $6x_1 + 3x_2 + 2x_3 \\ge 39$, $2x_1 + 2x_2 + x_3 \\ge 21$, $2x_1 \\le 17$, $x_1, x_2, x_3 \\ge 0$.
3. **$(LP_9)$**: $\\max F = 100x_1 + 500x_2 + 200x_3$ s.t. $x_1 + 3x_2 + 2x_3 \\le 60$, $4x_1 + 3x_3 \\ge 120$, $2x_1 + 2x_2 + x_3 = 40$, $x_1, x_2, x_3 \\ge 0$.`,
    hint: "In $(LP_7)$, multiply the second constraint $-x_1 - x_2 \\ge -8$ by $-1$ first to get $x_1 + x_2 \\le 8$: it only needs a slack variable $+e_2$, NOT an artificial variable!",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 6)

#### 1. Resolution of $(LP_7)$
- Multiplying $-x_1 - x_2 \\ge -8$ by $-1$ gives $x_1 + x_2 \\le 8$ ($+e_2$).
- Only the first constraint $2x_1 + x_2 \\ge 6$ requires surplus and artificial variables: $2x_1 + x_2 - e_1 + a_1 = 6$.
- Big-M Objective: $\\max F = 2x_1 + 5x_2 - M a_1$.
- Pivoting $x_1$ in (driving $a_1$ out), then $x_2$ and $e_1$, yields the optimal solution:
  $$\\mathbf{x_1^* = 6, \\quad x_2^* = 2, \\quad F^* = 2(6) + 5(2) = 22}$$

#### 2. Resolution of $(LP_8)$ ($\min F = 195x_1 + 160x_2 + 120x_3$)
- Optimal solution:
  $$\\mathbf{x_1^* = 5.5, \\quad x_2^* = 0, \\quad x_3^* = 10, \\quad F^* = 195(5.5) + 120(10) = 2,272.5}$$

#### 3. Resolution of $(LP_9)$
- Constraint 2 requires $4x_1 + 3x_3 \\ge 120$, while Constraint 3 requires $2x_1 + 2x_2 + x_3 = 40$ and Constraint 1 requires $x_1 + 3x_2 + 2x_3 \\le 60$.
- The maximum possible value of $4x_1 + 3x_3$ subject to C1 and C3 is $106.67 < 120$.
- Thus, the artificial variable $a_1$ remains strictly positive in the final basis: **$(LP_9)$ is INFEASIBLE (Empty Feasible Set)**!`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [2, 5],
        constraints: [
          { a: [2, 1], op: ">=", b: 6 },
          { a: [1, 1], op: "<=", b: 8 },
          { a: [0, 1], op: "<=", b: 2 }
        ]
      }
    }
  },
  {
    id: "td2-ex8",
    sheet: "TD2",
    badge: "TD2 - Ex 8",
    title: "Industrial Production Modeling: Workshops SP-1/SP-2 & Mecanex Corp.",
    topic: "Production Modeling & Simplex",
    difficulty: "Medium",
    examPriority: "HIGH",
    statement: `**Problem 1 (Workshops I & II)**:
A plant manufactures 2 sub-products **SP-1 ($x_1$)** and **SP-2 ($x_2$)** processed through Workshop I and Workshop II:
- Time per unit in Workshop I: $1.2\\text{ h}$ for SP-1, $0.8\\text{ h}$ for SP-2 (Max capacity: $1200\\text{ h/month}$).
- Time per unit in Workshop II: $1.0\\text{ h}$ for SP-1, $2.0\\text{ h}$ for SP-2 (Max capacity: $2000\\text{ h/month}$).
- Unit profit margin: $\\$9$ for SP-1, $\\$10$ for SP-2.

**Problem 2 (Mecanex Corp.)**:
Manufacturing 3 products $P_1, P_2, P_3$ across 3 machining centers (Center I: $5100\\text{ h}$, Center II: $5700\\text{ h}$, Center III: $4500\\text{ h}$):
- Center I: $3x_1 + 9x_2 + 2x_3 \\le 5100$
- Center II: $4x_1 + 3x_2 + 5x_3 \\le 5700$
- Center III: $3x_1 + 6x_2 + 3x_3 \\le 4500$
- Unit margins: $\\$18$ ($P_1$), $\\$36$ ($P_2$), $\\$16$ ($P_3$).`,
    hint: "Formulate each workshop/center as a $\\le$ capacity constraint and solve via Simplex.",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 8)

#### Problem 1: Products SP-1 ($x_1$) and SP-2 ($x_2$)
$$\\max Z = 9x_1 + 10x_2 \\quad \\text{s.t.} \\quad \\begin{cases} 1.2x_1 + 0.8x_2 \\le 1200 & (\\text{Workshop I}) \\\\ 1.0x_1 + 2.0x_2 \\le 2000 & (\\text{Workshop II}) \\\\ x_1, x_2 \\ge 0 \\end{cases}$$
- **Optimal Solution**: **$x_1^* = 500, \\quad x_2^* = 750$** with maximum profit **$Z^* = 9(500) + 10(750) = \\mathbf{\\$12,000}$**.

#### Problem 2: Mecanex Corp. ($P_1, P_2, P_3$)
$$\\max Z = 18x_1 + 36x_2 + 16x_3 \\quad \\text{s.t.} \\quad \\begin{cases} 3x_1 + 9x_2 + 2x_3 \\le 5100 \\\\ 4x_1 + 3x_2 + 5x_3 \\le 5700 \\\\ 3x_1 + 6x_2 + 3x_3 \\le 4500 \\\\ x_1, x_2, x_3 \\ge 0 \\end{cases}$$
- **Optimal Solution**: **$x_1^* = 600, \\quad x_2^* = 200, \\quad x_3^* = 500$** (all 3 machining centers are 100% saturated!).
- **Maximum Profit**: $Z^* = 18(600) + 36(200) + 16(500) = \\mathbf{\\$26,000}$.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [18, 36, 16],
        constraints: [
          { a: [3, 9, 2], op: "<=", b: 5100 },
          { a: [4, 3, 5], op: "<=", b: 5700 },
          { a: [3, 6, 3], op: "<=", b: 4500 }
        ]
      }
    }
  },
  {
    id: "td2-ex9",
    sheet: "TD2",
    badge: "TD2 - Ex 9",
    title: "Degeneracy, Beale's 6-Pivot Cycling Example & Bland's Rule",
    topic: "Degeneracy & Anti-Cycling",
    difficulty: "Theoretical / Classic",
    examPriority: "MEDIUM",
    statement: `Consider Beale's degenerate initial dictionary:
$$\\begin{aligned}
x_5 &= 0 - \\frac{1}{2}x_1 + \\frac{11}{2}x_2 + \\frac{5}{2}x_3 - 9x_4 \\\\
x_6 &= 0 - \\frac{1}{2}x_1 + \\frac{3}{2}x_2 + \\frac{1}{2}x_3 - x_4 \\\\
x_7 &= 1 - x_1 \\\\
z &= 0 + 10x_1 - 57x_2 - 9x_3 - 24x_4
\\end{aligned}$$
Explain why this problem cycles after 6 pivots under the standard largest-coefficient rule, and how **Bland's Rule** breaks the cycle.`,
    hint: "Because the right-hand sides of the first two equations are $0$, every pivot among $\\{x_1, x_2, x_3, x_4, x_5, x_6\\}$ has step length $0$ and leaves $z = 0$ unchanged!",
    solution: `### Complete Step-by-Step Solution (TD2 - Exercise 9)

1. **Why Cycling Occurs in 6 Pivots**:
   - The basic variables $x_5 = 0$ and $x_6 = 0$ are **degenerate** ($b_1 = b_2 = 0$).
   - Using the standard rule (largest reduced cost enters; smallest index leaves on ties), the sequence of 6 degenerate pivots is:
     - Pivot 1: $x_1$ enters, $x_5$ leaves ($z=0$)
     - Pivot 2: $x_2$ enters, $x_6$ leaves ($z=0$)
     - Pivot 3: $x_3$ enters, $x_1$ leaves ($z=0$)
     - Pivot 4: $x_4$ enters, $x_2$ leaves ($z=0$)
     - Pivot 5: $x_5$ enters, $x_3$ leaves ($z=0$)
     - Pivot 6: $x_6$ enters, $x_4$ leaves ($z=0$) $\\implies$ **Returns to the exact initial Dictionary 0!**
2. **How Bland's Rule Prevents Cycling**:
   - **Bland's Rule**: *Whenever multiple variables are eligible to enter (or leave), always pick the one with the **smallest subscript index**.*
   - At Iteration 5, both $x_1$ and $x_5$ have positive reduced costs. Instead of picking $x_5$, Bland's rule picks **$x_1$** ($1 < 5$), which drives $x_7 = 1$ out of the basis (non-degenerate pivot!) and reaches the true optimum **$z^* = 41/4 = 10.25$**!`
  },

  // ==========================================================================
  // TD 3: DUALITY, COMPLEMENTARY SLACKNESS & DUAL SIMPLEX
  // ==========================================================================
  {
    id: "td3-ex1",
    sheet: "TD3",
    badge: "TD3 - Ex 1",
    title: "Optimality Verification via Duality & Complementary Slackness (LP1 to LP3)",
    topic: "Duality & Complementary Slackness",
    difficulty: "Exam Classic",
    examPriority: "HIGH",
    statement: `Without running the Simplex algorithm on the Primal, answer the following using **Duality** and **Complementary Slackness**:
1. **$(LP_1)$**: $\\max z = 9x_1 + 6x_2 + 4x_3 + 100x_4$ s.t. $x_1 + x_2 + x_3 + 10x_4 \\le 20$ and $3x_1 + 2x_2 + x_3 + 25x_4 \\le 50$. Is $x^* = (10, 0, 0, 1)$ optimal?
2. **$(LP_2)$**: $\\max z = 7x_1 + 4x_2 + 2x_3 + 3x_4$ s.t. $2x_1 + x_2 + x_3 + x_4 \\le 24$, $x_1 + x_2 + x_3 + x_4 \\le 15$, $x_1 + x_2 + 2x_3 + x_4 \\le 25$. Is $x = (9, 6, 0, 0)$ optimal?
3. **$(LP_3)$**: $\\max z = 2x_1 + 4x_2 + 4x_3 - 3x_4$ s.t. $x_1 + x_2 + x_3 = 4$ and $x_1 + 4x_2 + x_4 = 8$. Find the optimal dual solution given that $x^* = (0, 2, 2, 0)$ is optimal.`,
    hint: "Always check Primal feasibility first! Then use Complementary Slackness: if $e_i^* > 0 \\implies y_i^* = 0$, and if $x_j^* > 0 \\implies$ dual constraint $j$ is a strict equality ($=$).",
    solution: `### Complete Step-by-Step Solution (TD3 - Exercise 1)

#### 1. Checking $x^* = (10, 0, 0, 1)$ for $(LP_1)$
- **Primal Feasibility Check**:
  - $C_1: 10 + 0 + 0 + 10(1) = 20 \\le 20$ (Tight)
  - $C_2: 3(10) + 0 + 0 + 25(1) = 55 > 50$ (**Violates Constraint 2!**)
  - Even if we tried Complementary Slackness ($y_1+3y_2=9$ and $10y_1+25y_2=100$), we would get $y_2 = -2 < 0$ (Dual infeasible!).
  - **Conclusion**: $x = (10, 0, 0, 1)$ is **NOT optimal** (in fact, the true optimum is $(0,0,0,2)$ with $z^* = 200$).

---

#### 2. Optimality Proof for $x = (9, 6, 0, 0)$ in $(LP_2)$
- **Primal Feasibility**:
  - $C_1: 2(9) + 6 = 24 \\le 24$ (Tight, $e_1 = 0$)
  - $C_2: 9 + 6 = 15 \\le 15$ (Tight, $e_2 = 0$)
  - $C_3: 9 + 6 = 15 < 25$ (**Not tight**, slack $e_3 = 10 > 0$).
- **Complementary Slackness**:
  - Since $e_3 = 10 > 0 \\implies \\mathbf{y_3 = 0}$.
  - Since $x_1 = 9 > 0$ and $x_2 = 6 > 0$, dual constraints 1 and 2 are strict equalities ($=$):
    $$\\begin{cases} 2y_1 + y_2 + y_3 = 7 \\\\ y_1 + y_2 + y_3 = 4 \\end{cases} \\xrightarrow{y_3=0} \\mathbf{y_1 = 3, \\; y_2 = 1, \\; y_3 = 0}$$
- **Checking Remaining Dual Constraints ($j=3, 4$)**:
  - Dual C3 ($x_3$): $y_1 + y_2 + 2y_3 = 3 + 1 + 0 = 4 \\ge 2$ (Holds ✅)
  - Dual C4 ($x_4$): $y_1 + y_2 + y_3 = 3 + 1 + 0 = 4 \\ge 3$ (Holds ✅)
  - And $y_1, y_2, y_3 \\ge 0$ (Holds ✅).
- **Conclusion**: Since $y^* = (3, 1, 0)$ is Dual-feasible, **$x^* = (9, 6, 0, 0)$ is OPTIMAL** with $z^* = w^* = \\mathbf{87}$!

---

#### 3. Optimal Dual Solution of $(LP_3)$ from $x^* = (0, 2, 2, 0)$
- Both primal constraints are **equations ($=$)**, so $y_1, y_2 \\in \\mathbb{R}$ are **unrestricted in sign**.
- Since $x_2^* = 2 > 0$ and $x_3^* = 2 > 0$, dual constraints 2 and 3 hold with equality:
  $$\\begin{cases} y_1 + 4y_2 = 4 & (x_2) \\\\ y_1 = 4 & (x_3) \\end{cases} \\implies \\mathbf{y_1^* = 4, \\quad y_2^* = 0}$$
- Checking Dual C1 ($4+0 = 4 \\ge 2$ ✅) and Dual C4 ($0 \\ge -3$ ✅) confirms optimality with $w^* = 4(4) + 8(0) = 16 = z^*$.`
  },
  {
    id: "td3-ex2",
    sheet: "TD3",
    badge: "TD3 - Ex 2",
    title: "Dual Simplex Method & Adding a New Constraint (LP5 & LP6)",
    topic: "Dual Simplex & Post-Optimal Re-Optimization",
    difficulty: "Advanced",
    examPriority: "MEDIUM",
    statement: `1. Solve **$(LP_5)$** by Simplex: $\\max z = 6x_1 + 14x_2 + 13x_3$ s.t. $0.5x_1 + 2x_2 + x_3 \\le 24$ and $x_1 + 2x_2 + 4x_3 \\le 60$. Then add the constraint **$x_2 \\ge 1$** and re-optimize using the **Dual Simplex** method.
2. Use the Dual Simplex method directly to solve **$(LP_6)$**:
$$\\min z = 3x_1 + 4x_2 \\quad \\text{s.t.} \\quad \\begin{cases} x_1 + x_2 \\ge 3 \\\\ 2x_1 + 3x_2 \\ge 4 \\\\ x_1, x_2 \\ge 0 \\end{cases}$$`,
    hint: "For $(LP_6)$, multiply both constraints by $-1$ to get $-x_1 - x_2 + e_1 = -3$ and $-2x_1 - 3x_2 + e_2 = -4$. The objective row is already dual-feasible, and $b_i < 0$: apply Dual Simplex!",
    solution: `### Complete Step-by-Step Solution (TD3 - Exercise 2)

#### 1. $(LP_5)$ + Adding Constraint $x_2 \\ge 1$
- **Optimum of $(LP_5)$ before adding the constraint**:
  - Optimal basis: $(x_1 = 36, x_3 = 6)$ with $x_2 = 0$ and $z^* = 6(36) + 13(6) = \\mathbf{294}$.
- **Adding $x_2 \\ge 1 \\iff -x_2 + e_3 = -1$**:
  - Since $x_2 = 0$ at the previous optimum, the new constraint is violated ($e_3 = -1 < 0$).
  - Appending $-x_2 + e_3 = -1$ and performing one **Dual Simplex pivot** ($e_3$ leaves, $x_2$ enters) gives:
  - **$x_1^* = 34, \\; x_2^* = 1, \\; x_3^* = 5$** with **$z^* = 283$**.

#### 2. Solving $(LP_6)$ via Dual Simplex
Multiply both constraints by $-1$:
$$\\begin{cases} -x_1 - x_2 + e_1 = -3 \\\\ -2x_1 - 3x_2 + e_2 = -4 \\\\ \\max(-z) = -3x_1 - 4x_2 \\end{cases}$$
- **Dual Pivot 1**: Most negative RHS is $b_2 = -4 \\implies e_2$ leaves. Ratios $|(c_j-z_j)/a_{2j}|$: for $x_1: |-3/-2| = 1.5$; for $x_2: |-4/-3| = 1.333$ (Min) $\\implies x_2$ enters.
- **Dual Pivot 2**: $e_1$ leaves, $x_1$ enters $\\implies$ **Optimum $(x_1^*, x_2^*) = (3, 0)$ with $z^* = 9$**.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "min",
        c: [3, 4],
        constraints: [
          { a: [1, 1], op: ">=", b: 3 },
          { a: [2, 3], op: ">=", b: 4 }
        ]
      }
    }
  },
  {
    id: "td3-ex3",
    sheet: "TD3",
    badge: "TD3 - Ex 3",
    title: "Mobile Phone Stock Clearance & Wholesale Buyout Prices (Dual)",
    topic: "Modeling, Simplex & Economic Interpretation of Duality",
    difficulty: "Exam Classic",
    examPriority: "HIGH",
    statement: `A retailer wants to clear out a stock of **$8$ mobile phones**, **$4$ hands-free kits**, and **$19$ prepaid cards** using two bundle offers:
- **Offer 1 ($x_1$, sold for $7\\text{ €}$)**: $1$ phone + $1$ hands-free kit + $2$ prepaid cards.
- **Offer 2 ($x_2$, sold for $9\\text{ €}$)**: $1$ phone + $3$ prepaid cards.
1. Formulate and solve the LP maximizing total revenue.
2. A wholesaler offers to buy the individual stock items at unit prices $y_1$ (phone), $y_2$ (hands-free kit), and $y_3$ (prepaid card). Formulate the Dual LP and deduce the optimal unit prices $(y_1^*, y_2^*, y_3^*)$.`,
    hint: "At the continuous optimum $(x_1^*, x_2^*) = (4, 11/3)$, check which stock resource has leftover slack ($e_1^* > 0$) to immediately deduce which dual price equals $0$!",
    solution: `### Complete Step-by-Step Solution (TD3 - Exercise 3)

#### 1. Primal LP Formulation & Resolution
$$\\max Z = 7x_1 + 9x_2 \\quad \\text{s.t.} \\quad \\begin{cases} x_1 + x_2 \\le 8 & (\\text{Phones } \\to y_1) \\\\ x_1 \\le 4 & (\\text{Hands-free kits } \\to y_2) \\\\ 2x_1 + 3x_2 \\le 19 & (\\text{Prepaid cards } \\to y_3) \\\\ x_1, x_2 \\ge 0 \\end{cases}$$
- **Continuous Optimum**: Intersection of Kits ($x_1 = 4$) and Cards ($2x_1+3x_2=19$) gives **$x_1^* = 4, \\; x_2^* = \\frac{11}{3} \\approx 3.67$** (which uses $4 + 11/3 = 7.67 \\le 8$ phones) with **$Z^* = 7(4) + 9(11/3) = \\mathbf{61\\text{ €}}$**.

#### 2. Dual LP & Wholesaler Unit Prices
$$\\min W = 8y_1 + 4y_2 + 19y_3 \\quad \\text{s.t.} \\quad \\begin{cases} y_1 + y_2 + 2y_3 \\ge 7 & (\\text{Offer 1}) \\\\ y_1 + 3y_3 \\ge 9 & (\\text{Offer 2}) \\\\ y_1, y_2, y_3 \\ge 0 \\end{cases}$$
- By Complementary Slackness at $(4, 11/3)$:
  - Phone constraint has leftover slack $e_1^* = 8 - 23/3 = 1/3 > 0 \\implies \\mathbf{y_1^* = 0}$.
  - Since $x_1^* > 0$ and $x_2^* > 0$, both dual constraints are tight:
    - $0 + 3y_3^* = 9 \\implies \\mathbf{y_3^* = 3\\text{ €}}$ per prepaid card.
    - $0 + y_2^* + 2(3) = 7 \\implies \\mathbf{y_2^* = 1\\text{ €}}$ per hands-free kit.
  - Check: $W^* = 8(0) + 4(1) + 19(3) = \\mathbf{61\\text{ €}} = Z^*$.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [7, 9],
        constraints: [
          { a: [1, 1], op: "<=", b: 8 },
          { a: [1, 0], op: "<=", b: 4 },
          { a: [2, 3], op: "<=", b: 19 }
        ]
      }
    }
  },

  // ==========================================================================
  // SHEET NO. 4: THE BRANCH-AND-BOUND METHOD
  // ==========================================================================
  {
    id: "td4-ex1",
    sheet: "TD4",
    badge: "Sheet 4 - Ex 1",
    title: "Assignment Problem by Branch-and-Bound (3 Employees × 3 Tasks)",
    topic: "Branch-and-Bound (Assignment)",
    difficulty: "Medium",
    examPriority: "HIGH",
    statement: `A department head has three unmarried employees ($E_1, E_2, E_3$) and must assign each of them to one of three tasks ($t_1, t_2, t_3$). The salary cost matrix $C = (c_{ij})$ is:

| Employee \\ Task | $t_1$ | $t_2$ | $t_3$ |
| :--- | :---: | :---: | :---: |
| **$E_1$** | $15$ | $22$ | $64$ |
| **$E_2$** | $65$ | $22$ | $20$ |
| **$E_3$** | $17$ | $47$ | $42$ |

1. Formulate this problem as an Integer Linear Program (ILP).
2. Solve it using the **Branch-and-Bound** method (using row minimums to compute Lower Bounds $LB$).`,
    hint: "Compute the initial Root Lower Bound by summing the minimum cost in each employee row: $15 + 20 + 17 = 52$. Then branch on $E_1$'s assignment ($t_1, t_2, t_3$).",
    solution: `### Complete Step-by-Step Solution (Sheet 4 - Exercise 1: Assignment B&B)

#### 1. ILP Formulation
Let $x_{ij} \\in \\{0, 1\\}$ equal $1$ if employee $E_i$ is assigned to task $t_j$ ($0$ otherwise):
$$\\min Z = \\sum_{i=1}^3 \\sum_{j=1}^3 c_{ij} x_{ij} \\quad \\text{s.t.} \\quad \\begin{cases} \\sum_{j=1}^3 x_{ij} = 1, & \\forall i \\in \\{1,2,3\\} \\\\ \\sum_{i=1}^3 x_{ij} = 1, & \\forall j \\in \\{1,2,3\\} \\\\ x_{ij} \\in \\{0, 1\\} \\end{cases}$$

#### 2. Branch-and-Bound Resolution
- **Root Node $N_0$**: Row minimums give $E_1 \\to t_1 (15)$, $E_2 \\to t_3 (20)$, $E_3 \\to t_1 (17) \\implies LB_0 = 15 + 20 + 17 = \\mathbf{52}$ (conflict on $t_1$).
- **Level 1 Branches (Assigning $E_1$)**:
  1. **Branch A ($E_1 \\to t_1$, cost $= 15$)**: Remaining tasks for $E_2, E_3$ are $\\{t_2, t_3\\}$:
     - $\\min E_2 = 20 (t_3)$, $\\min E_3 = 42 (t_3) \\implies LB_A = 15 + 20 + 42 = \\mathbf{77}$ (conflict on $t_3$).
  2. **Branch B ($E_1 \\to t_2$, cost $= 22$)**: Remaining tasks for $E_2, E_3$ are $\\{t_1, t_3\\}$:
     - $\\min E_2 = 20 (t_3)$, $\\min E_3 = 17 (t_1)$.
     - **No conflict!** $E_1 \\to t_2 (22)$, $E_2 \\to t_3 (20)$, $E_3 \\to t_1 (17)$ is a **valid complete assignment** with total cost:
       $$Z_B = 22 + 20 + 17 = \\mathbf{59}$$
  3. **Branch C ($E_1 \\to t_3$, cost $= 64$)**: $LB_C = 64 + 22 + 17 = 103 > 59$ (Pruned!).
- Since $Z_B = 59 < LB_A = 77$, Branch A is immediately **pruned by bound ($77 > 59$)**!
- **Optimal Assignment**: **$E_1 \\to t_2$, $E_2 \\to t_3$, $E_3 \\to t_1$** with minimum cost **$Z^* = 59$**!`
  },
  {
    id: "td4-ex2",
    sheet: "TD4",
    badge: "Sheet 4 - Ex 2",
    title: "0/1 Knapsack Problem by Branch-and-Bound (Capacity W = 14)",
    topic: "Branch-and-Bound (0/1 Knapsack)",
    difficulty: "Exam Classic",
    examPriority: "HIGH",
    statement: `Solve the following 0/1 Knapsack Problem using the **Branch-and-Bound** method:
$$\\max Z = 8x_1 + 11x_2 + 6x_3 + 4x_4 \\quad \\text{s.t.} \\quad 5x_1 + 7x_2 + 4x_3 + 3x_4 \\le 14, \\quad x_i \\in \\{0, 1\\}.$$`,
    hint: "1) Efficiency ratios $c_i / a_i$: $x_1: 8/5 = 1.60$, $x_2: 11/7 \\approx 1.57$, $x_3: 6/4 = 1.50$, $x_4: 4/3 \\approx 1.33$ (already sorted!). 2) At Root Node N0, pack $x_1=1 (5), x_2=1 (7)$, leaving $2\\text{ kg}$ for $x_3 \\implies x_3 = 2/4 = 0.5, UB_0 = 22$.",
    solution: `### Complete Step-by-Step Solution (Sheet 4 - Exercise 2: Knapsack B&B)

#### 1. Sorting by Efficiency Ratio ($c_i / a_i$)
| Item | Profit $c_i$ | Weight $a_i$ | Ratio $c_i / a_i$ | Rank |
| :---: | :---: | :---: | :---: | :---: |
| **$x_1$** | $8$ | $5$ | **$1.60$** | 1st |
| **$x_2$** | $11$ | $7$ | **$1.571$** | 2nd |
| **$x_3$** | $6$ | $4$ | **$1.50$** | 3rd |
| **$x_4$** | $4$ | $3$ | **$1.333$** | 4th |

#### 2. Branch-and-Bound Tree Exploration
- **Node 0 (Root)**: $x_1=1 (5), x_2=1 (7), x_3=2/4=0.5, x_4=0 \\implies \\mathbf{UB_0 = 22}$. Branch on **$x_3$**:
- **Node 1 ($x_3 = 1$)**: $x_3=1 (4), x_1=1 (5)$, remaining $5\\text{ kg}$ for $x_2 (7) \\implies x_2 = 5/7, x_4=0 \\implies \\mathbf{UB_1 = 21.86}$. Branch on **$x_2$**:
  - **Sub-node $x_3=1, x_2=1$**: Weight $7+4=11$, remaining $3\\text{ kg}$ for $x_1 (5) \\implies x_1 = 3/5, UB = 21.8$.
    - Branch $x_1 = 1 \\implies 5+7+4 = 16 > 14$ (**Infeasible**).
    - Branch $x_1 = 0 \\implies$ remaining $3\\text{ kg}$ fits $x_4 = 1 (3\\text{ kg})$ exactly! **All-Integer Solution $x^* = (0, 1, 1, 1)$ with $Z^* = 11 + 6 + 4 = \\mathbf{21}$!**
  - **Sub-node $x_3=1, x_2=0$**: Integer solution $(1, 0, 1, 1)$ with weight $12 \\le 14$ and $Z = 18 < 21$ (Pruned).
- **Node 2 ($x_3 = 0$)**: $x_1=1 (5), x_2=1 (7), x_4=2/3 \\implies UB_2 = 21.67$.
  - Branch $x_4=1 \\implies 5+7+3 = 15 > 14$ (Infeasible); Branch $x_4=0 \\implies (1,1,0,0)$ with $Z = 19 < 21$.

#### 3. Conclusion
Optimal integer solution: **$x^* = (0, 1, 1, 1)$** (items 2, 3, and 4) with maximum profit **$Z^* = 21$** (weight $= 14$).`,
    solverPreset: {
      solverType: "knapsack",
      data: {
        capacity: 14,
        items: [
          { name: "x_1", profit: 8, weight: 5 },
          { name: "x_2", profit: 11, weight: 7 },
          { name: "x_3", profit: 6, weight: 4 },
          { name: "x_4", profit: 4, weight: 3 }
        ]
      }
    }
  },
  {
    id: "td4-ex3",
    sheet: "TD4",
    badge: "Sheet 4 - Ex 3",
    title: "Single-Machine Task Scheduling by Branch-and-Bound (Minimize Total Tardiness)",
    topic: "Branch-and-Bound (Scheduling)",
    difficulty: "Advanced",
    examPriority: "MEDIUM",
    statement: `Four tasks ($i = 1, 2, 3, 4$) must be processed sequentially without interruption on a single machine (total processing time $\\sum p_i = 12 + 8 + 15 + 9 = 44$):

| Task $i$ | **1** | **2** | **3** | **4** |
| :--- | :---: | :---: | :---: | :---: |
| Processing time $p_i$ | $12$ | $8$ | $15$ | $9$ |
| Due date $d_i$ | $16$ | $26$ | $25$ | $27$ |

Find the sequence of tasks that **minimizes total tardiness (delay)** $\\sum_{i=1}^4 R_i = \\sum_{i=1}^4 \\max(c_i - d_i, 0)$ using Branch-and-Bound (scheduling backwards from the **last position**!).`,
    hint: "Whichever task is placed in the **4th (last) position** finishes at time $C = 12 + 8 + 15 + 9 = 44$! Compute the delay of the 4th task for each of the 4 candidates ($4, 3, 2, 1$ in last place).",
    solution: `### Complete Step-by-Step Solution (Sheet 4 - Exercise 3: Scheduling B&B)

#### 1. Backwards Branching from Position 4 (Completion Time $= 44$)
The task placed in 4th position finishes at $t = 44$ with delay $R_k = \\max(44 - d_k, 0)$:
- **Branch $(\\cdot, \\cdot, \\cdot, 1)$**: $R_1 = 44 - 16 = 28$
- **Branch $(\\cdot, \\cdot, \\cdot, 2)$**: $R_2 = 44 - 26 = 18$
- **Branch $(\\cdot, \\cdot, \\cdot, 3)$**: $R_3 = 44 - 25 = 19$
- **Branch $(\\cdot, \\cdot, \\cdot, 4)$**: $R_4 = 44 - 27 = 17$

#### 2. Exploring $(\\cdot, \\cdot, \\cdot, 4)$ vs. $(\\cdot, \\cdot, \\cdot, 3)$
- In $(\\cdot, \\cdot, \\cdot, 4)$, the first 3 tasks finish at $44 - 9 = 35$:
  - Sequence $(1, 2, 3, 4)$ gives delays $R_1=0, R_2=0, R_3=35-25=10, R_4=17 \\implies \\sum R_i = 27$.
- In $(\\cdot, \\cdot, \\cdot, 3)$ ($R_3 = 19$), the first 3 tasks $\\{1, 2, 4\\}$ finish at $44 - 15 = 29$:
  - Sequence **$(1, 2, 4, 3)$**:
    - $c_1 = 12 \\le 16 \\implies R_1 = 0$
    - $c_2 = 12 + 8 = 20 \\le 26 \\implies R_2 = 0$
    - $c_4 = 20 + 9 = 29 \\implies R_4 = 29 - 27 = 2$
    - $c_3 = 29 + 15 = 44 \\implies R_3 = 44 - 25 = 19$
    - **Total tardiness of $(1, 2, 4, 3)$ (and $(1, 4, 2, 3)$)**: $\\sum R_i = 0 + 0 + 2 + 19 = \\mathbf{21}$!
- All other branches have lower bounds $\\ge 27 > 21$ and are pruned.
- **Optimal Sequence**: **$(1, 2, 4, 3)$** (or **$(1, 4, 2, 3)$**) with **minimum total delay $= 21$**.`
  },

  // ==========================================================================
  // OFFICIAL FINAL EXAM: UNIVERSITÉ ORAN 1 (ING3-SI)
  // ==========================================================================
  {
    id: "exam-ex1",
    sheet: "EXAM",
    badge: "Final Exam - Ex 1 (10 pts)",
    title: "Simplex, Sensitivity Range of c₂, Dual Formulation & Complementary Slackness",
    topic: "Complete Final Exam Problem (Simplex + Sensitivity + Duality)",
    difficulty: "Official Final Exam (10/20)",
    examPriority: "HIGH",
    statement: `Consider the following linear program $(P)$:
$$\\begin{aligned}
\\max Z &= 3x_1 + 2x_2 \\\\
\\text{s.t.} \\quad & \\begin{cases}
x_1 \\le 4 & (1) \\\\
2x_2 \\le 12 & (2) \\\\
3x_1 + 2x_2 \\le 18 & (3) \\\\
x_1, x_2 \\ge 0
\\end{cases}
\\end{aligned}$$

**Questions:**
1. Write program $(P)$ in **Standard Form**.
2. Solve $(P)$ using the **Simplex Algorithm**.
3. Within what interval can the objective coefficient of $x_2$ ($c_2$, initially equal to $2$) vary without changing the optimal basis?
4. Write the **Dual Program $(D)$** associated with $(P)$.
5. Using the **Complementary Slackness conditions**, deduce the optimal solution $(y_1^*, y_2^*, y_3^*)$ of the Dual $(D)$.`,
    hint: "In Tableau 0, $x_1$ enters and $e_1$ leaves ($x_1=4, Z=12$). In Tableau 1, $x_2$ enters and $e_3$ leaves ($x_2=3, Z^*=18$). Notice that $3x_1+2x_2$ is parallel to Constraint 3, so both $(4,3)$ and $(2,6)$ are optimal corners with $Z^*=18$!",
    solution: `### Official Complete Solution — Final Exam Exercise 1 (10 Points)

#### 1. Standard Form of $(P)$
Adding slack variables $e_1, e_2, e_3 \\ge 0$:
$$\\max Z = 3x_1 + 2x_2 + 0e_1 + 0e_2 + 0e_3 \\quad \\text{s.t.} \\quad \\begin{cases} x_1 + e_1 = 4 \\\\ 2x_2 + e_2 = 12 \\\\ 3x_1 + 2x_2 + e_3 = 18 \\\\ x_1, x_2, e_1, e_2, e_3 \\ge 0 \\end{cases}$$

---

#### 2. Simplex Tableau Resolution
- **Tableau 0**: Basis $(e_1=4, e_2=12, e_3=18)$, $Z = 0$.
  - Entering variable: **$x_1$** ($c_1 - z_1 = +3$).
  - Ratios: $R_1: 4/1 = \\mathbf{4}$ (Min), $R_2: 12/0 = \\text{—}$, $R_3: 18/3 = 6$.
  - Leaving variable: **$e_1$** (pivot $= 1$).
- **Tableau 1**: Basis $(x_1=4, e_2=12, e_3=6)$, $Z = 12$.
  - Row operation $R_3' \\leftarrow R_3 - 3R_1'$ gives: $0x_1 + 2x_2 - 3e_1 + 0e_2 + 1e_3 = 6$.
  - Entering variable: **$x_2$** ($c_2 - z_2 = +2$).
  - Ratios: $R_1: \\text{—}$, $R_2: 12/2 = 6$, $R_3: 6/2 = \\mathbf{3}$ (Min).
  - Leaving variable: **$e_3$** (pivot $= 2$).
- **Tableau 2 (Optimal)**:
  - Basis $(x_1=4, e_2=6, x_2=3)$ with **$Z^* = 18$**.
  - Because the objective $3x_1 + 2x_2$ is parallel to constraint (3) $3x_1 + 2x_2 \\le 18$, the reduced cost of $e_1$ is $0$: pivoting $e_1$ in (and $e_2$ out) gives the alternate optimal corner **$(x_1^*, x_2^*) = (2, 6)$** with **$Z^* = 18$**!

---

#### 3. Stability Range of $c_2$ (Initially $c_2 = 2$)
Let $c_2^{\\text{new}} = 2 + \\delta$.
- **At optimal basis $B_1 = (x_1=4, e_2=6, x_2=3)$** (where the $x_2$-row is $x_2 - \\frac{3}{2}e_1 + \\frac{1}{2}e_3 = 3$ and final reduced costs are $0 e_1 - 1 e_3$):
  - Column $e_1$: $0 - \\delta(-3/2) \\le 0 \\implies \\delta \\le 0$.
  - Column $e_3$: $-1 - \\delta(1/2) \\le 0 \\implies \\delta \\ge -2$.
  - Thus $B_1$ remains optimal for **$-2 \\le \\delta \\le 0 \\iff c_2 \\in [0, 2]$**.
- **At alternate optimal basis $B_2 = (x_1=2, x_2=6, e_1=2)$** (where the $x_2$-row is $x_2 + \\frac{1}{2}e_2 = 6$):
  - Column $e_2$: $0 - \\delta(1/2) \\le 0 \\implies \\delta \\ge 0 \\iff c_2 \\in [2, +\\infty)$.

---

#### 4. Dual Program $(D)$
Assigning dual variables $y_1, y_2, y_3$ to constraints $(1), (2), (3)$:
$$\\begin{aligned}
\\min W &= 4y_1 + 12y_2 + 18y_3 \\\\
\\text{s.t.} \\quad & \\begin{cases}
y_1 + 3y_3 \\ge 3 & (\\text{for } x_1) \\\\
2y_2 + 2y_3 \\ge 2 & (\\text{for } x_2) \\\\
y_1, y_2, y_3 \\ge 0
\\end{cases}
\\end{aligned}$$

---

#### 5. Deducing $(y_1^*, y_2^*, y_3^*)$ via Complementary Slackness
1. At optimal corner $(4, 3)$, constraint (2) has slack $e_2^* = 12 - 2(3) = 6 > 0 \\implies \\mathbf{y_2^* = 0}$.
   At optimal corner $(2, 6)$, constraint (1) has slack $e_1^* = 4 - 2 = 2 > 0 \\implies \\mathbf{y_1^* = 0}$.
2. Since $x_1^* > 0$ and $x_2^* > 0$, both dual constraints hold with equality ($=$):
   $$\\begin{cases} y_1^* + 3y_3^* = 3 \\\\ 2y_2^* + 2y_3^* = 2 \\end{cases} \\implies \\mathbf{y_1^* = 0, \\quad y_2^* = 0, \\quad y_3^* = 1}$$
3. **Verification**: $W^* = 4(0) + 12(0) + 18(1) = \\mathbf{18} = Z^*$.`,
    solverPreset: {
      solverType: "simplex",
      data: {
        type: "max",
        c: [3, 2],
        constraints: [
          { a: [1, 0], op: "<=", b: 4 },
          { a: [0, 2], op: "<=", b: 12 },
          { a: [3, 2], op: "<=", b: 18 }
        ]
      }
    }
  },
  {
    id: "exam-ex2",
    sheet: "EXAM",
    badge: "Final Exam - Ex 2 (6 pts)",
    title: "Capital Budgeting / Investment Selection (0/1 Knapsack B&B)",
    topic: "Branch-and-Bound (0/1 Knapsack)",
    difficulty: "Official Final Exam (6/20)",
    examPriority: "HIGH",
    statement: `A company has a budget of **$20\\text{ MDA}$** to invest among $4$ candidate projects:

| Investment $i$ | **1** | **2** | **3** | **4** |
| :--- | :---: | :---: | :---: | :---: |
| Cost $a_i$ (in MDA) | $9$ | $7$ | $8$ | $7$ |
| Expected Profit $c_i$ (in MDA) | $45$ | $21$ | $23$ | $11$ |

Use the **Branch-and-Bound** method to determine which investments to select to maximize total expected profit without exceeding the $20\\text{ MDA}$ budget.`,
    hint: "Efficiency ratios $c_i / a_i$ are $5.0$, $3.0$, $2.875$, and $1.571$ (already in descending order!). Start at Root Node N0 with $x_1=1, x_2=1, x_3=0.5 \\implies UB_0 = 77.5$ and branch on $x_3$.",
    solution: `### Official Complete Solution — Final Exam Exercise 2 (6 Points)

#### 1. ILP Model & Efficiency Ratios
$$\\max Z = 45x_1 + 21x_2 + 23x_3 + 11x_4 \\quad \\text{s.t.} \\quad 9x_1 + 7x_2 + 8x_3 + 7x_4 \\le 20, \\quad x_i \\in \\{0, 1\\}.$$
- **Efficiency Ratios $c_i / a_i$**:
  - $I_1: 45 / 9 = \\mathbf{5.00}$ (Rank 1)
  - $I_2: 21 / 7 = \\mathbf{3.00}$ (Rank 2)
  - $I_3: 23 / 8 = \\mathbf{2.875}$ (Rank 3)
  - $I_4: 11 / 7 \\approx \\mathbf{1.571}$ (Rank 4)

#### 2. Branch-and-Bound Tree
- **Node 0 (Root)**: $x_1=1 (9), x_2=1 (7), x_3=4/8=0.5, x_4=0 \\implies \\mathbf{UB_0 = 77.5}$. Branch on **$x_3$**:
- **Node 1 ($x_3 = 1$)**: $x_3=1 (8), x_1=1 (9)$, remaining $3\\text{ MDA}$ for $x_2 (7) \\implies x_2 = 3/7, UB_1 = 77.0$. Branch on **$x_2$**:
  - **Sub-node $x_3=1, x_2=1$**: $x_2=1 (7), x_3=1 (8)$, remaining $5$ for $x_1 (9) \\implies x_1 = 5/9, UB = 69$.
    - $x_1 = 1 \\implies 9+7+8 = 24 > 20$ (**Infeasible**).
    - $x_1 = 0 \\implies UB = 51.86$ (Pruned).
  - **Sub-node $x_3=1, x_2=0$**: $x_1=1 (9), x_3=1 (8)$, remaining $3$ for $x_4 (7) \\implies x_4 = 3/7, UB = 72.71$.
    - $x_4 = 1 \\implies 9+8+7 = 24 > 20$ (**Infeasible**).
    - $x_4 = 0 \\implies$ **All-Integer Solution $x^* = (1, 0, 1, 0)$ with $Z^* = 45 + 23 = \\mathbf{68\\text{ MDA}}$** (Budget used $= 17\\text{ MDA}$).
- **Node 2 ($x_3 = 0$)**: $x_1=1 (9), x_2=1 (7), x_4=4/7 \\implies UB_2 = 72.29$.
  - $x_4 = 1 \\implies UB = 68 \\le 68$ (Pruned by bound).
  - $x_4 = 0 \\implies$ Integer solution $(1, 1, 0, 0)$ with $Z = 66 < 68$.

#### 3. Conclusion
Select **Investments 1 and 3** ($x^* = (1, 0, 1, 0)$) for a maximum profit of **$Z^* = 68\\text{ MDA}$**.`,
    solverPreset: {
      solverType: "knapsack",
      data: {
        capacity: 20,
        items: [
          { name: "x_1", profit: 45, weight: 9 },
          { name: "x_2", profit: 21, weight: 7 },
          { name: "x_3", profit: 23, weight: 8 },
          { name: "x_4", profit: 11, weight: 7 }
        ]
      }
    }
  },
  {
    id: "exam-ex3",
    sheet: "EXAM",
    badge: "Final Exam - Ex 3 (4 pts)",
    title: "Linearisation of Non-Linear Functions (Minimax & Absolute Value)",
    topic: "Linearisation Techniques",
    difficulty: "Official Final Exam (4/20 — Fast Points!)",
    examPriority: "HIGH",
    statement: `Transform the following non-linear optimization problems into equivalent **Linear Programs**:

**1. Minimax Problem:**
$$\\begin{aligned}
\\min Z &= \\max(7x_1 + 4x_2 + x_3, \\; x_1 - 3x_3) \\\\
\\text{s.t.} \\quad & \\begin{cases}
x_1 + x_2 + x_3 \\le 12 \\\\
2x_1 + x_2 - x_3 \\ge 5 \\\\
x_1, x_2, x_3 \\ge 0
\\end{cases}
\\end{aligned}$$

**2. Absolute Value Problem:**
$$\\begin{aligned}
\\min F &= 2x_1 + 3|x_2 - 10| \\\\
\\text{s.t.} \\quad & \\begin{cases}
x_1 + x_2 \\le 15 \\\\
|x_1 - 2x_2| \\le 6 \\\\
x_1, x_2 \\ge 0
\\end{cases}
\\end{aligned}$$`,
    hint: "1) For $\\min \\max(A, B)$, introduce $t = \\max(A, B)$ and minimize $t$ subject to $t \\ge A$ and $t \\ge B$. 2) For $|x_2 - 10|$, set $x_2 - 10 = u^+ - u^-$ and $|x_2 - 10| = u^+ + u^-$ with $u^+, u^- \\ge 0$. Split $|x_1 - 2x_2| \\le 6$ into $-6 \\le x_1 - 2x_2 \\le 6$!",
    solution: `### Official Complete Solution — Final Exam Exercise 3 (4 Points)

#### 1. Linearising the Minimax Problem
Introduce a real variable $t = \\max(7x_1 + 4x_2 + x_3, \\; x_1 - 3x_3)$.
Since we are **minimizing** $t$, this is equivalent to $t \\ge 7x_1 + 4x_2 + x_3$ and $t \\ge x_1 - 3x_3$:
$$\\begin{aligned}
\\min Z &= t \\\\
\\text{s.t.} \\quad & \\begin{cases}
7x_1 + 4x_2 + x_3 - t \\le 0 \\\\
x_1 - 3x_3 - t \\le 0 \\\\
x_1 + x_2 + x_3 \\le 12 \\\\
2x_1 + x_2 - x_3 \\ge 5 \\\\
x_1, x_2, x_3 \\ge 0, \\quad t \\in \\mathbb{R} \\; (\\text{or } t = t^+ - t^-)
\\end{cases}
\\end{aligned}$$

---

#### 2. Linearising the Absolute Value Problem
1. **In the Objective Function**: $|x_2 - 10|$.
   Introduce two non-negative variables $u^+ \\ge 0$ and $u^- \\ge 0$ such that:
   $$x_2 - 10 = u^+ - u^- \\iff x_2 - u^+ + u^- = 10, \\qquad |x_2 - 10| = u^+ + u^-$$
2. **In the Constraint**: $|x_1 - 2x_2| \\le 6 \\iff -6 \\le x_1 - 2x_2 \\le 6$:
   $$\\begin{cases} x_1 - 2x_2 \\le 6 \\\\ -x_1 + 2x_2 \\le 6 \\end{cases}$$

**Final Equivalent Linear Program:**
$$\\begin{aligned}
\\min F &= 2x_1 + 3u^+ + 3u^- \\\\
\\text{s.t.} \\quad & \\begin{cases}
x_2 - u^+ + u^- = 10 \\\\
x_1 + x_2 \\le 15 \\\\
x_1 - 2x_2 \\le 6 \\\\
-x_1 + 2x_2 \\le 6 \\\\
x_1, x_2, u^+, u^- \\ge 0
\\end{cases}
\\end{aligned}$$`
  }
];
