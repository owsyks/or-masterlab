// ============================================================================
// OR STUDY PLATFORM - EXACT MATHEMATICAL SOLVERS & VERIFIERS
// Supports:
//   1. 2D Graphical LP Solver (Vertices, Feasible Region Polygon, Iso-Profit)
//   2. Step-by-Step Simplex & Big-M Solver (Tableaux, Dictionaries, Sensitivity, Dual)
//   3. 0/1 Knapsack Branch-and-Bound Tree Generator & Solver
// ============================================================================

(function (global) {
  const EPS = 1e-8;

  function roundClean(val, decimals = 4) {
    if (Math.abs(val) < EPS) return 0;
    const r = Math.round(val);
    if (Math.abs(val - r) < 1e-6) return r;
    return Number(val.toFixed(decimals));
  }

  // Format a number as a clean fraction or decimal for Simplex tableaux
  function toFrac(val, maxDenom = 240) {
    if (val === null || val === undefined || isNaN(val)) return "-";
    if (Math.abs(val) < EPS) return "0";
    const sign = val < 0 ? "-" : "";
    const abs = Math.abs(val);
    if (Math.abs(abs - Math.round(abs)) < 1e-5) {
      return sign + Math.round(abs).toString();
    }
    let bestNum = Math.round(abs);
    let bestDen = 1;
    let minErr = Math.abs(abs - bestNum);
    for (let d = 2; d <= maxDenom; d++) {
      const n = Math.round(abs * d);
      const err = Math.abs(abs - n / d);
      if (err < minErr - 1e-7) {
        minErr = err;
        bestNum = n;
        bestDen = d;
        if (err < 1e-6) break;
      }
    }
    if (minErr < 1e-4 && bestDen > 1) {
      return `${sign}${bestNum}/${bestDen}`;
    }
    return sign + roundClean(abs, 2).toString();
  }

  // ==========================================================================
  // 1. 2D GRAPHICAL LP SOLVER
  // ==========================================================================
  function solveGraphical2D(problem) {
    // problem: { type: 'max'|'min', c: [c1, c2], constraints: [{ a1, a2, op: '<='|'>='|'=', b, label }] }
    const { type, c, constraints } = problem;
    const [c1, c2] = c;

    // Include non-negativity constraints x1 >= 0, x2 >= 0
    const allLines = [
      ...constraints.map((con, idx) => ({
        a1: Number(con.a1),
        a2: Number(con.a2),
        op: con.op || "<=",
        b: Number(con.b),
        label: con.label || `C${idx + 1}`,
        isAxis: false,
      })),
      { a1: 1, a2: 0, op: ">=", b: 0, label: "x₁ ≥ 0", isAxis: true },
      { a1: 0, a2: 1, op: ">=", b: 0, label: "x₂ ≥ 0", isAxis: true },
    ];

    // Determine bounding scale for plotting
    let maxCoord = 10;
    for (const l of allLines) {
      if (!l.isAxis) {
        if (Math.abs(l.a1) > EPS && l.b / l.a1 > 0) maxCoord = Math.max(maxCoord, l.b / l.a1);
        if (Math.abs(l.a2) > EPS && l.b / l.a2 > 0) maxCoord = Math.max(maxCoord, l.b / l.a2);
      }
    }
    maxCoord = Math.ceil(maxCoord * 1.25);
    if (maxCoord < 6) maxCoord = 10;

    function isFeasible(x1, x2) {
      if (x1 < -1e-5 || x2 < -1e-5) return false;
      for (const l of constraints) {
        const lhs = l.a1 * x1 + l.a2 * x2;
        if (l.op === "<=" && lhs > l.b + 1e-5) return false;
        if (l.op === ">=" && lhs < l.b - 1e-5) return false;
        if (l.op === "=" && Math.abs(lhs - l.b) > 1e-5) return false;
      }
      return true;
    }

    // Add bounding box lines to clip unbounded regions cleanly for polygon drawing
    const boundLimit = maxCoord * 2;
    const linesWithBox = [
      ...allLines,
      { a1: 1, a2: 0, op: "<=", b: boundLimit, label: "BoundX", isBound: true },
      { a1: 0, a2: 1, op: "<=", b: boundLimit, label: "BoundY", isBound: true },
    ];

    const intersections = [];
    for (let i = 0; i < linesWithBox.length; i++) {
      for (let j = i + 1; j < linesWithBox.length; j++) {
        const L1 = linesWithBox[i];
        const L2 = linesWithBox[j];
        const det = L1.a1 * L2.a2 - L2.a1 * L1.a2;
        if (Math.abs(det) > EPS) {
          const x1 = (L1.b * L2.a2 - L2.b * L1.a2) / det;
          const x2 = (L1.a1 * L2.b - L2.a1 * L1.b) / det;
          if (x1 >= -1e-5 && x2 >= -1e-5 && x1 <= boundLimit + 1e-5 && x2 <= boundLimit + 1e-5) {
            const cleanX1 = Math.max(0, roundClean(x1, 4));
            const cleanX2 = Math.max(0, roundClean(x2, 4));
            const feasible = isFeasible(cleanX1, cleanX2);
            const isBoxVertex = Boolean(L1.isBound || L2.isBound);
            // Deduplicate
            const exists = intersections.find(
              (pt) => Math.abs(pt.x1 - cleanX1) < 1e-3 && Math.abs(pt.x2 - cleanX2) < 1e-3
            );
            if (!exists) {
              const z = roundClean(c1 * cleanX1 + c2 * cleanX2, 4);
              intersections.push({
                x1: cleanX1,
                x2: cleanX2,
                z,
                feasible,
                isBoxVertex,
                lines: [L1.label, L2.label],
              });
            } else {
              if (!L1.isBound && !exists.lines.includes(L1.label)) exists.lines.push(L1.label);
              if (!L2.isBound && !exists.lines.includes(L2.label)) exists.lines.push(L2.label);
              if (!isBoxVertex) exists.isBoxVertex = false;
            }
          }
        }
      }
    }

    const feasiblePolygonPts = intersections.filter((pt) => pt.feasible);
    const trueVertices = feasiblePolygonPts.filter((pt) => !pt.isBoxVertex);

    // Sort polygon points counterclockwise around centroid
    if (feasiblePolygonPts.length >= 3) {
      const cx = feasiblePolygonPts.reduce((s, p) => s + p.x1, 0) / feasiblePolygonPts.length;
      const cy = feasiblePolygonPts.reduce((s, p) => s + p.x2, 0) / feasiblePolygonPts.length;
      feasiblePolygonPts.sort((a, b) => Math.atan2(a.x2 - cy, a.x1 - cx) - Math.atan2(b.x2 - cy, b.x1 - cx));
    }

    // Label true feasible vertices A, B, C, ...
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    trueVertices.forEach((v, idx) => {
      v.name = letters[idx] || `V${idx + 1}`;
    });

    // Determine status & optimal vertex
    let status = "optimal";
    let optimalVertices = [];
    let optimalZ = null;

    if (feasiblePolygonPts.length === 0) {
      status = "infeasible";
    } else {
      // Check if box vertices give strictly better Z than true vertices
      const allSorted = [...feasiblePolygonPts].sort((a, b) =>
        type === "max" ? b.z - a.z : a.z - b.z
      );
      const bestOverall = allSorted[0];
      if (bestOverall.isBoxVertex) {
        // Check if any true vertex ties with bestOverall
        const tiedTrue = trueVertices.filter((v) => Math.abs(v.z - bestOverall.z) < 1e-4);
        if (tiedTrue.length === 0) {
          status = "unbounded";
        }
      }
      if (status !== "unbounded" && trueVertices.length > 0) {
        const sortedTrue = [...trueVertices].sort((a, b) =>
          type === "max" ? b.z - a.z : a.z - b.z
        );
        optimalZ = sortedTrue[0].z;
        optimalVertices = sortedTrue.filter((v) => Math.abs(v.z - optimalZ) < 1e-4);
        if (optimalVertices.length > 1) {
          status = "multiple_optimal";
        }
      }
    }

    return {
      status,
      optimalZ,
      optimalVertices,
      trueVertices,
      feasiblePolygonPts,
      allIntersections: intersections.filter((p) => !p.isBoxVertex && p.x1 <= maxCoord * 1.15 && p.x2 <= maxCoord * 1.15),
      maxCoord,
    };
  }

  // ==========================================================================
  // 2. STEP-BY-STEP SIMPLEX & BIG-M SOLVER (WITH SENSITIVITY & DUALITY)
  // ==========================================================================
  function solveSimplex(problem) {
    // problem: { type: 'max'|'min', c: [c1, c2, ...], constraints: [{ a: [a1, a2, ...], op: '<='|'>='|'=', b }] }
    const isMax = (problem.type || "max").toLowerCase() === "max";
    const numDec = problem.c.length;
    const rawConstraints = problem.constraints.map((con) => {
      let a = [...con.a];
      let b = Number(con.b);
      let op = con.op || "<=";
      let flipped = false;
      if (b < 0) {
        a = a.map((v) => -v);
        b = -b;
        if (op === "<=") op = ">=";
        else if (op === ">=") op = "<=";
        flipped = true;
      }
      return { a, op, b, flipped };
    });

    const m = rawConstraints.length;
    const varNames = [];
    const varTypes = []; // 'decision', 'slack', 'surplus', 'artificial'
    const objCoeffs = []; // in Max form
    const objBigM = []; // coefficient of M in Max form (-1 for artificial in Max)

    for (let j = 0; j < numDec; j++) {
      varNames.push(`x_${j + 1}`);
      varTypes.push("decision");
      objCoeffs.push(isMax ? Number(problem.c[j]) : -Number(problem.c[j]));
      objBigM.push(0);
    }

    // Build columns for slack/surplus and artificial variables
    const rowConfigs = [];
    let slackCount = 0;
    let artCount = 0;

    for (let i = 0; i < m; i++) {
      const op = rawConstraints[i].op;
      if (op === "<=") {
        slackCount++;
        const sIdx = varNames.length;
        varNames.push(`e_${i + 1}`);
        varTypes.push("slack");
        objCoeffs.push(0);
        objBigM.push(0);
        rowConfigs.push({ slackIdx: sIdx, slackSign: 1, artIdx: -1, basicIdx: sIdx });
      } else if (op === ">=") {
        slackCount++;
        const sIdx = varNames.length;
        varNames.push(`e_${i + 1}`);
        varTypes.push("surplus");
        objCoeffs.push(0);
        objBigM.push(0);

        artCount++;
        const aIdx = varNames.length;
        varNames.push(`a_${artCount}`);
        varTypes.push("artificial");
        objCoeffs.push(0);
        objBigM.push(-1); // In Max, artificial gets -M
        rowConfigs.push({ slackIdx: sIdx, slackSign: -1, artIdx: aIdx, basicIdx: aIdx });
      } else {
        // '='
        artCount++;
        const aIdx = varNames.length;
        varNames.push(`a_${artCount}`);
        varTypes.push("artificial");
        objCoeffs.push(0);
        objBigM.push(-1);
        rowConfigs.push({ slackIdx: -1, slackSign: 0, artIdx: aIdx, basicIdx: aIdx });
      }
    }

    const totalVars = varNames.length;
    const usesBigM = artCount > 0;

    // Matrix A (m x totalVars) and RHS b (m)
    const A = [];
    const b = [];
    const basis = [];

    for (let i = 0; i < m; i++) {
      const row = new Array(totalVars).fill(0);
      for (let j = 0; j < numDec; j++) {
        row[j] = rawConstraints[i].a[j];
      }
      const cfg = rowConfigs[i];
      if (cfg.slackIdx !== -1) row[cfg.slackIdx] = cfg.slackSign;
      if (cfg.artIdx !== -1) row[cfg.artIdx] = 1;
      A.push(row);
      b.push(rawConstraints[i].b);
      basis.push(cfg.basicIdx);
    }

    const tableaux = [];
    let iter = 0;
    const maxIter = 25;
    let status = "optimal";

    function computeReducedCosts() {
      // z_j = sum_i (c_B[i] + M * m_B[i]) * A[i][j]
      // reducedCost_j = (c_j - z_j)
      const cj_zj_num = new Array(totalVars).fill(0);
      const cj_zj_M = new Array(totalVars).fill(0);
      let zVal_num = 0;
      let zVal_M = 0;

      for (let i = 0; i < m; i++) {
        const bVar = basis[i];
        zVal_num += objCoeffs[bVar] * b[i];
        zVal_M += objBigM[bVar] * b[i];
      }

      for (let j = 0; j < totalVars; j++) {
        let zj_num = 0;
        let zj_M = 0;
        for (let i = 0; i < m; i++) {
          const bVar = basis[i];
          zj_num += objCoeffs[bVar] * A[i][j];
          zj_M += objBigM[bVar] * A[i][j];
        }
        cj_zj_num[j] = objCoeffs[j] - zj_num;
        cj_zj_M[j] = objBigM[j] - zj_M;
      }

      return { cj_zj_num, cj_zj_M, zVal_num, zVal_M };
    }

    while (iter < maxIter) {
      const { cj_zj_num, cj_zj_M, zVal_num, zVal_M } = computeReducedCosts();

      // Numeric evaluation of reduced cost using large M = 100000 for entering variable selection
      const BIG_M_VAL = 100000;
      let enterCol = -1;
      let bestEval = 1e-6;

      for (let j = 0; j < totalVars; j++) {
        // Don't re-enter artificial variables
        if (varTypes[j] === "artificial") continue;
        const evalRC = cj_zj_M[j] * BIG_M_VAL + cj_zj_num[j];
        if (evalRC > bestEval) {
          bestEval = evalRC;
          enterCol = j;
        }
      }

      // Compute ratios if enterCol !== -1
      const ratios = new Array(m).fill(null);
      let leaveRow = -1;
      let minRatio = Infinity;
      let isTie = false;

      if (enterCol !== -1) {
        for (let i = 0; i < m; i++) {
          const a_ie = A[i][enterCol];
          if (a_ie > EPS) {
            const r = b[i] / a_ie;
            ratios[i] = r;
            if (r < minRatio - EPS) {
              minRatio = r;
              leaveRow = i;
              isTie = false;
            } else if (Math.abs(r - minRatio) <= EPS) {
              isTie = true;
            }
          }
        }
      }

      const isDegenerate = b.some((val) => Math.abs(val) < EPS);
      const rowOps = [];

      if (enterCol !== -1 && leaveRow !== -1) {
        const pivotVal = A[leaveRow][enterCol];
        rowOps.push(`R_${leaveRow + 1}' ← R_${leaveRow + 1} / (${toFrac(pivotVal)})`);
        for (let i = 0; i < m; i++) {
          if (i !== leaveRow && Math.abs(A[i][enterCol]) > EPS) {
            const factor = A[i][enterCol];
            const signStr = factor >= 0 ? `- ${toFrac(factor)}` : `+ ${toFrac(-factor)}`;
            rowOps.push(`R_${i + 1}' ← R_${i + 1} ${signStr} × R_${leaveRow + 1}'`);
          }
        }
      }

      tableaux.push({
        iter,
        A: A.map((r) => [...r]),
        b: [...b],
        basis: [...basis],
        cj_zj_num: [...cj_zj_num],
        cj_zj_M: [...cj_zj_M],
        zVal_num: isMax ? zVal_num : -zVal_num,
        zVal_M: isMax ? zVal_M : -zVal_M,
        enterCol,
        leaveRow,
        pivotElem: enterCol !== -1 && leaveRow !== -1 ? A[leaveRow][enterCol] : null,
        ratios,
        isDegenerate,
        causesDegeneracyNext: isTie,
        rowOps,
      });

      if (enterCol === -1) {
        status = "optimal";
        break;
      }

      if (leaveRow === -1) {
        status = "unbounded";
        break;
      }

      // Perform Gauss-Jordan pivot
      const pivot = A[leaveRow][enterCol];
      for (let j = 0; j < totalVars; j++) {
        A[leaveRow][j] /= pivot;
      }
      b[leaveRow] /= pivot;

      for (let i = 0; i < m; i++) {
        if (i !== leaveRow) {
          const factor = A[i][enterCol];
          if (Math.abs(factor) > EPS) {
            for (let j = 0; j < totalVars; j++) {
              A[i][j] -= factor * A[leaveRow][j];
            }
            b[i] -= factor * b[leaveRow];
          }
        }
      }
      basis[leaveRow] = enterCol;
      iter++;
    }

    // Check if any artificial variable remains in basis with b_i > 0
    const finalTab = tableaux[tableaux.length - 1];
    for (let i = 0; i < m; i++) {
      const bVar = finalTab.basis[i];
      if (varTypes[bVar] === "artificial" && finalTab.b[i] > 1e-4) {
        status = "infeasible";
      }
    }

    // Extract primal solution
    const solution = {};
    varNames.forEach((name, j) => {
      solution[name] = 0;
    });
    for (let i = 0; i < m; i++) {
      solution[varNames[finalTab.basis[i]]] = roundClean(finalTab.b[i], 4);
    }

    // Post-optimal Sensitivity Analysis (when status === 'optimal' and no artificial vars in basis)
    const sensitivity = { cRanges: [], bRanges: [], shadowPrices: [] };
    if (status === "optimal") {
      // 1. Objective coefficient ranges c_k for decision variables
      for (let k = 0; k < numDec; k++) {
        const origCk = Number(problem.c[k]);
        const basisRow = finalTab.basis.indexOf(k);
        let minDelta = -Infinity;
        let maxDelta = Infinity;

        if (basisRow === -1) {
          // Non-basic variable: reduced cost in Max is c_k - z_k <= 0
          // New reduced cost = (c_k - z_k) + delta <= 0 => delta <= -(c_k - z_k)
          const rc = finalTab.cj_zj_num[k];
          if (isMax) {
            maxDelta = -rc;
          } else {
            minDelta = rc;
          }
        } else {
          // Basic variable in row `basisRow`
          // For every non-basic variable j (non-artificial):
          // New (c_j - z_j) = old (c_j - z_j) - delta * a_{basisRow, j} <= 0 (in Max)
          for (let j = 0; j < totalVars; j++) {
            if (finalTab.basis.includes(j) || varTypes[j] === "artificial") continue;
            const a_kj = finalTab.A[basisRow][j];
            const rc_j = finalTab.cj_zj_num[j]; // <= 0 at optimal
            if (Math.abs(a_kj) > EPS) {
              // rc_j - deltaMax * a_kj <= 0  =>  deltaMax * a_kj >= rc_j
              const bound = rc_j / a_kj; // note rc_j <= 0
              if (a_kj > 0) {
                minDelta = Math.max(minDelta, bound);
              } else {
                maxDelta = Math.min(maxDelta, bound);
              }
            }
          }
          if (!isMax) {
            const tmp = -maxDelta;
            maxDelta = -minDelta;
            minDelta = tmp;
          }
        }

        sensitivity.cRanges.push({
          varName: varNames[k],
          origC: origCk,
          isBasic: basisRow !== -1,
          minC: minDelta === -Infinity ? "-∞" : toFrac(origCk + minDelta),
          maxC: maxDelta === Infinity ? "+∞" : toFrac(origCk + maxDelta),
          minDelta: minDelta === -Infinity ? "-∞" : toFrac(minDelta),
          maxDelta: maxDelta === Infinity ? "+∞" : toFrac(maxDelta),
        });
      }

      // 2. RHS ranges b_i & Shadow Prices for slack/surplus constraints
      for (let i = 0; i < m; i++) {
        const cfg = rowConfigs[i];
        const origB = rawConstraints[i].b;
        if (cfg.slackIdx !== -1) {
          const sCol = cfg.slackIdx;
          const sign = cfg.slackSign; // +1 for <=, -1 for >=
          // Shadow price y_i^* = - (c_s - z_s) * sign
          const rawShadow = -finalTab.cj_zj_num[sCol] * sign * (isMax ? 1 : -1);
          let minDelta = -Infinity;
          let maxDelta = Infinity;

          for (let r = 0; r < m; r++) {
            const colVal = finalTab.A[r][sCol] * sign;
            if (Math.abs(colVal) > EPS) {
              // b_r + delta * colVal >= 0 => delta * colVal >= -b_r
              const bound = -finalTab.b[r] / colVal;
              if (colVal > 0) {
                minDelta = Math.max(minDelta, bound);
              } else {
                maxDelta = Math.min(maxDelta, bound);
              }
            }
          }

          sensitivity.bRanges.push({
            constraintIdx: i + 1,
            slackVar: varNames[sCol],
            origB,
            shadowPrice: toFrac(rawShadow),
            shadowPriceNum: roundClean(rawShadow, 4),
            minB: minDelta === -Infinity ? "-∞" : toFrac(origB + minDelta),
            maxB: maxDelta === Infinity ? "+∞" : toFrac(origB + maxDelta),
            minDelta: minDelta === -Infinity ? "-∞" : toFrac(minDelta),
            maxDelta: maxDelta === Infinity ? "+∞" : toFrac(maxDelta),
          });
        }
      }
    }

    // Construct Dual Problem representation
    const dual = buildDualProblem(problem);

    return {
      status,
      isMax,
      usesBigM,
      varNames,
      varTypes,
      objCoeffs: problem.c,
      tableaux,
      solution,
      optimalZ: finalTab ? roundClean(finalTab.zVal_num, 4) : null,
      optimalZFrac: finalTab ? toFrac(finalTab.zVal_num) : "-",
      sensitivity,
      dual,
      toFrac,
    };
  }

  function buildDualProblem(problem) {
    const isMax = (problem.type || "max").toLowerCase() === "max";
    const dualType = isMax ? "min" : "max";
    const m = problem.constraints.length;
    const n = problem.c.length;

    const dualObjTerms = problem.constraints.map((con, i) => ({
      coeff: Number(con.b),
      varName: `y_${i + 1}`,
    }));

    const dualConstraints = [];
    for (let j = 0; j < n; j++) {
      const coeffs = problem.constraints.map((con) => Number(con.a[j]));
      // Assuming x_j >= 0: Max primal -> Dual constraint >= c_j; Min primal -> Dual constraint <= c_j
      const op = isMax ? ">=" : "<=";
      dualConstraints.push({
        coeffs,
        op,
        rhs: Number(problem.c[j]),
        primalVar: `x_${j + 1}`,
      });
    }

    const dualSignRules = problem.constraints.map((con, i) => {
      const op = con.op || "<=";
      if (isMax) {
        if (op === "<=") return `y_${i + 1} ≥ 0`;
        if (op === ">=") return `y_${i + 1} ≤ 0`;
        return `y_${i + 1} free (unrestricted)`;
      } else {
        if (op === ">=") return `y_${i + 1} ≥ 0`;
        if (op === "<=") return `y_${i + 1} ≤ 0`;
        return `y_${i + 1} free (unrestricted)`;
      }
    });

    return {
      dualType,
      dualObjTerms,
      dualConstraints,
      dualSignRules,
    };
  }

  // ==========================================================================
  // 3. 0/1 KNAPSACK BRANCH-AND-BOUND SOLVER
  // ==========================================================================
  function solveKnapsackBB(problem) {
    // problem: { capacity: W, items: [{ name, profit, weight }] }
    const W = Number(problem.capacity);
    const items = problem.items.map((it, idx) => ({
      origIdx: idx + 1,
      name: it.name || `x_${idx + 1}`,
      profit: Number(it.profit),
      weight: Number(it.weight),
      ratio: Number(it.profit) / Number(it.weight),
    }));

    // Sort by efficiency ratio descending
    const sorted = [...items].sort((a, b) => b.ratio - a.ratio);
    const n = sorted.length;

    function computeRelaxation(fixedMap) {
      // fixedMap: { [sortedIdx]: 0 or 1 }
      let usedWeight = 0;
      let currentProfit = 0;
      const values = new Array(n).fill(0);

      for (let i = 0; i < n; i++) {
        if (fixedMap[i] === 1) {
          usedWeight += sorted[i].weight;
          currentProfit += sorted[i].profit;
          values[i] = 1;
        } else if (fixedMap[i] === 0) {
          values[i] = 0;
        }
      }

      if (usedWeight > W + EPS) {
        return { feasible: false, usedWeight, ub: -Infinity, values, fracIdx: -1 };
      }

      let fracIdx = -1;
      for (let i = 0; i < n; i++) {
        if (fixedMap[i] === undefined) {
          const rem = W - usedWeight;
          if (sorted[i].weight <= rem + EPS) {
            usedWeight += sorted[i].weight;
            currentProfit += sorted[i].profit;
            values[i] = 1;
          } else {
            if (rem > EPS) {
              const frac = rem / sorted[i].weight;
              values[i] = frac;
              currentProfit += sorted[i].profit * frac;
              usedWeight = W;
              fracIdx = i;
            }
            break;
          }
        }
      }

      return {
        feasible: true,
        usedWeight: roundClean(usedWeight, 3),
        ub: roundClean(currentProfit, 3),
        ubFloor: Math.floor(currentProfit + EPS),
        values,
        fracIdx,
        isAllInteger: fracIdx === -1,
      };
    }

    const nodes = [];
    let bestIncumbent = -Infinity;
    let bestNodeId = null;
    let nodeCounter = 0;

    function explore(fixedMap, parentId, branchLabel, depth) {
      const id = nodeCounter++;
      const relax = computeRelaxation(fixedMap);
      const node = {
        id,
        parentId,
        branchLabel,
        depth,
        fixedMap: { ...fixedMap },
        ...relax,
        status: "active", // 'root', 'branched', 'integer_incumbent', 'pruned_infeasible', 'pruned_bound'
      };
      nodes.push(node);

      if (!relax.feasible) {
        node.status = "pruned_infeasible";
        return;
      }

      if (relax.ub <= bestIncumbent + EPS) {
        node.status = "pruned_bound";
        return;
      }

      if (relax.isAllInteger) {
        node.status = "integer_incumbent";
        if (relax.ub > bestIncumbent) {
          bestIncumbent = relax.ub;
          bestNodeId = id;
        }
        return;
      }

      node.status = id === 0 ? "root" : "branched";
      const fIdx = relax.fracIdx;
      const varName = sorted[fIdx].name;

      // Branch x_k = 1 first, then x_k = 0 (standard knapsack B&B convention)
      explore({ ...fixedMap, [fIdx]: 1 }, id, `${varName} = 1`, depth + 1);
      explore({ ...fixedMap, [fIdx]: 0 }, id, `${varName} = 0`, depth + 1);
    }

    explore({}, null, "Root (LP Relaxation)", 0);

    // Map optimal solution back to original item order
    const bestNode = nodes.find((nd) => nd.id === bestNodeId) || null;
    const origSolution = {};
    if (bestNode) {
      sorted.forEach((it, sIdx) => {
        origSolution[it.name] = bestNode.values[sIdx];
      });
    }

    return {
      capacity: W,
      sortedItems: sorted,
      nodes,
      bestIncumbent: bestIncumbent === -Infinity ? null : bestIncumbent,
      bestNodeId,
      origSolution,
      toFrac,
    };
  }

  global.ORSolvers = {
    solveGraphical2D,
    solveSimplex,
    buildDualProblem,
    solveKnapsackBB,
    toFrac,
    roundClean,
  };
})(typeof window !== "undefined" ? window : globalThis);
