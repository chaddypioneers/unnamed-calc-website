// Mathjax loading
const initialElementsToTypeset = ['updateHistory', 'what', 'links', 'whyCalc', 'credits', 'progress2', 'progress8', 'progress10', 'trigIdentities'];
var typesetElements = initialElementsToTypeset.slice();

function mathjaxPageReady() {
  if (elementsExist('drawingBoard')) {
    MathJax.typeset();
  }
  else {
    get('loading').innerText = '';
    for (var elementID of initialElementsToTypeset) {
      if (elementsExist(elementID)) {
        MathJax.typeset([get(elementID)]);
      }
    }
    for (var unit of unitsToTypeset) {
      typesetUnit(unit);
    }
  }
}

MathJax = {
  chtml: {
    // Set the display of MathJax equations
    displayAlign: 'left',
    minScale: 1.25,
    matchFontHeight: false
  },
  startup: {
    ready: () => {
      get('loading').innerText = 'Loading math expressions... Some features will not work properly until loading finishes.';
      setTimeout(() => MathJax.startup.defaultReady());
      MathJax.startup.promise.then(mathjaxPageReady);
    },
    typeset: false
  },
  loader: {
    load: ['ui/lazy', '[tex]/physics']
  },
  options: {
    lazyMargin: '500px'
  },
  tex: {
    packages: {'[+]': ['physics']}
  }
};

// Math functions
function slowPartialSum(func) {
  // Returns a function that manually calculates the partial sum. It's slow so only use when you can't find an expression for the partial sum.
  return n => {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
      sum += func(i);
    }
    return sum;
  }
}

function sec(x) {
  return 1 / Math.cos(x);
}

function csc(x) {
  return 1 / Math.sin(x);
}

function cot(x) {
  return 1 / Math.tan(x);
}

function mod(x, y) {
  // Fixes x % y not returning correct values for negative numbers
  return ((x % y) + y) % y;
}

function factorial(n) {
  var result = 1;
  for (var i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

function arcLength(func, interval, segments) {
  var a = interval[0];
  var b = interval[1];
  var width = (b - a) / segments;
  var totalLength = 0;
  for (var i = 1; i <= segments; i++) {
    var deltaY = func(i * width + a) - func((i - 1) * width + a);
    totalLength += Math.sqrt(width ** 2 + deltaY ** 2);
  }
  return totalLength;
}

function isComplex(num) {
  return math.typeOf(num) === 'Complex';
}

function taylorApprox(x, type, degree) {
  var total = 0;
  if (type === 'sin') {
    for (var n = 0; 2 * n + 1 <= degree; n++) {
      total += (-1) ** n * x ** (2 * n + 1) / factorial(2 * n + 1);
    }
  }
  else if (type === 'cos') {
    for (var n = 0; 2 * n <= degree; n++) {
      total += (-1) ** n * x ** (2 * n) / factorial(2 * n);
    }
  }
  else if (type === 'exp') {
    for (var n = 0; n <= degree; n++) {
      if (isComplex(x)) {
        total = math.add(total, math.divide(math.pow(x, n), factorial(n)));
      }
      else {
        total += x ** n / factorial(n);
      }
    }
  }
  else if (type === 'ln') {
    for (var n = 1; n <= degree; n++) {
      total += (-1) ** (n + 1) * (x - 1) ** n / n;
    }
  }
  else if (type === 'sinh') {
    for (var n = 0; 2 * n + 1 <= degree; n++) {
      total += x ** (2 * n + 1) / factorial(2 * n + 1);
    }
  }
  else if (type === 'cosh') {
    for (var n = 0; 2 * n <= degree; n++) {
      total += x ** (2 * n) / factorial(2 * n);
    }
  }
  else if (type === 'reciprocal') {
    for (var n = 0; n <= degree; n++) {
      total += (-1) ** n * (x - 1) ** n;
    }
  }
  else if (type === 'geometric') {
    for (var n = 0; n <= degree; n++) {
      total += x ** n;
    }
  }
  return total;
}

var lastPSeriesSum = {
  'p': null,
  'n': null,
  'sum': null
}

function pSeriesSum(n) {
  var p = round(getSliderValue('pSeriesPValue'), 2);
  if (p === lastPSeriesSum['p'] && n === lastPSeriesSum['n']) {
    // Don't bother calculating it again if it's already been calculated
    return lastPSeriesSum['sum'];
  }
  var negativeP = -p;
  var sum = 0;
  for (var i = 1; i <= n; i++) {
    // This is faster than sum += i ** negativeP;
    sum += Math.exp(Math.log(i) * negativeP);
  }
  lastPSeriesSum['p'] = p;
  lastPSeriesSum['n'] = n;
  lastPSeriesSum['sum'] = sum;
  return sum;
}

const eulersConstant = 0.577215664901532;
function harmonicSum(n) {
  if (n < 100) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
      sum += 1 / i;
    }
    return sum;
  }
  // Approximation of harmonic partial sum
  return Math.log(n) + eulersConstant + 1 / (2 * n) - 1 / (12 * n ** 2);
}

function altHarmonicSum(n) {
  if (n < 1e4) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
      sum += (-1) ** (i + 1) / i;
    }
    return sum;
  }
  // Approximation of alternating harmonic partial sum
  var newN = n - n % 2;
  var sum = Math.log(2) - 1 / (2 * newN);
  if (n % 2 === 1) {
    sum += 1 / n;
  }
  return sum;
}

function gammaIntegral(x, b) {
  if (x === 0) {
    return NaN;
  }
  if (b === 0 && x >= 1) {
    return 0;
  }
  var sum = 0;
  if (b > 1) {
    sum += riemannSum(t => t ** (x - 1) * Math.exp(-t), [1, b], 100000, 'trapezoid');
  }
  if (x < 1) {
    var highPrecisionIterations = 300;
  }
  else {
    var highPrecisionIterations = 10;
  }
  // Calculate trapezoidal sum over [0.1, 1], [0.01, 0.1], [0.001, 0.01], etc. for higher accuracy
  for (var i = 1; i <= highPrecisionIterations; i++) {
    if (b > 0.1 ** i) {
      sum += riemannSum(t => t ** (x - 1) * Math.exp(-t), [0.1 ** i, Math.min(b, 0.1 ** (i - 1))], 1000, 'trapezoid');
    }
  }
  if (x <= 0.5) {
    return round(sum, 4);
  }
  return sum;
}

const eStr = '2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746639193200305992181741359662904357290033429526059563073813232862794349076323382988075319525101901157383418793070215408914993488416750924476146066808226480016847741185374234544243710753907774499206955170276183860626133138458300075204493382656029760673711320070932870912744374704723069697720931014169283681902551510865746377211125238978442505695369677078544996996794686445490598793163688923009879312';

var digitsOfETimestamp = null;
function digitsOfEInput() {
  clearTimeout(calcDigitsOfETimeout);
  var degree = parseInt(get('digitsOfEInput').value);
  if (isFinite(degree)) {
    if (degree < 1) {
      get('digitsOfEOutput').innerHTML = '<span class="red">To get any correct digits of e, the degree must be at least 1.</span>';
    }
    else {
      get('digitsOfECalculation').classList.remove('hidden');
      digitsOfETimestamp = Date.now();
      var polynomialStr = '1/0!';
      if (degree <= 5) {
        for (var i = 1; i <= degree; i++) {
          polynomialStr += ` + 1/${i}!`;
        }
      }
      else {
        var polynomialStr = `1/0! + 1/1! + 1/2! + 1/3! + ... + 1/${formatNum(degree)}!`;
      }
      get('digitsOfEPolynomial').innerText = polynomialStr;
      calcDigitsOfE(degree);
    }
  }
}

var calcDigitsOfETimeout = null;

function calcDigitsOfE(degree) {
  if (degree < 10000) {
    var chunkSize = 500;
  }
  else if (degree < 25000) {
    var chunkSize = 200;
  }
  else {
    var chunkSize = 100;
  }
  // By the Lagrange error bound, the maximum error of exp(1) using the Taylor series of degree n is e / (n+1)!
  var reciprocalOfErrorBound = math.divide(math.factorial(math.bignumber(degree + 1)), math.bignumber(math.e));
  var digitsNeeded = math.floor(math.number(math.log10(reciprocalOfErrorBound)));
  const bigmath = math.create({
    number: 'BigNumber',
    precision: Math.max(digitsNeeded + 2, 10) // a few more digits than we can be confident in
  });
  var result = bigmath.bignumber(0);
  var term = bigmath.bignumber(1);
  if (degree < 2000) {
    for (var i = 0; i <= degree; i++) {
      result = bigmath.add(result, term);
      term = bigmath.divide(term, i + 1);
    }
    calcDigitsOfEFinished(result);
  }
  else {
    var i = 0;
    calcDigitsOfEChunk(bigmath, result, term, i, degree, chunkSize);
  }
}

function calcDigitsOfEChunk(bigmath, result, term, index, degree, chunkSize) {
  for (var i = index; i <= Math.min(index + chunkSize - 1, degree); i++) {
    result = bigmath.add(result, term);
    term = bigmath.divide(term, i + 1);
  }
  if (index + chunkSize - 1 >= degree) {
    calcDigitsOfEFinished(result);
  }
  else {
    get('digitsOfEOutput').innerText = `Calculating... (${formatNum(i)}/${formatNum(degree)})`;
    calcDigitsOfETimeout = setTimeout(() => calcDigitsOfEChunk(bigmath, result, term, i, degree, chunkSize));
  }
}

function calcDigitsOfEFinished(result) {
  var resultStr = result.toString();
  var outputStr = '';
  // If there are less than 500 digits, then compare the calculated digits to the actual digits of e and only return the digits that are correct
  // Otherwise return the calculated value with the last few digits chopped off
  for (var i = 0; i < eStr.length; i++) {
    if (resultStr[i] === eStr[i]) {
      outputStr += eStr[i];
    }
    else {
      break;
    }
  }
  if (resultStr.length > 502) {
    var digits = resultStr.slice(0, -2); // last few digits might be incorrect so don't return them
  }
  else {
    var digits = outputStr.replace(/\.$/, '');
  }
  get('digitsOfETime').innerText = `It took ${round((Date.now() - digitsOfETimestamp) / 1000, 3)} seconds to calculate ${formatNum(Math.max(0, digits.length - 2))} digits of e. Here they are:`;
  get('digitsOfEOutput').innerText = digits;
}

// Custom text for show/hide buttons. Defaults to "Show" / "Hide" if not specified
const customTextButtons = {
  'demoCanvasDiv': {
    'showText': 'Show Rectangle',
    'hideText': 'Hide Rectangle'
  },
  'progress': {
    'showText': 'Show Current Progress',
    'hideText': 'Hide Current Progress'
  },
  'otherSites': {
    'showText': 'Show Other Sites',
    'hideText': 'Hide Other Sites'
  },
  'introPopup': {
    'showText': 'Show Intro Popup',
    'hideText': 'Hide Intro Popup'
  },
  'personalStory': {
    'showText': 'Show Personal Story',
    'hideText': 'Hide Personal Story'
  },
  'conjugateReminder': {
    'showText': 'Remind me about conjugates.',
    'hideText': 'Hide Reminder'
  },
  'limitsNotExisting1Graph': {
    'showText': 'Show me a graph of this function.',
    'hideText': 'Hide Graph'
  },
  'limitsNotExisting1Answer': {
    'showText': 'Why doesn’t the limit exist?',
    'hideText': 'Hide Answer'
  },
  'limitsNotExisting2Graph': {
    'showText': 'Show me a graph of this function.',
    'hideText': 'Hide Graph'
  },
  'limitsNotExisting2Answer': {
    'showText': 'Why doesn’t the limit exist?',
    'hideText': 'Hide Answer'
  },
  'limitsNotExisting3Graph': {
    'showText': 'Show me a graph of this function.',
    'hideText': 'Hide Graph'
  },
  'limitsNotExisting3Answer': {
    'showText': 'Why doesn’t the limit exist?',
    'hideText': 'Hide Answer'
  },
  'limAtInfExamples': {
    'showText': 'Show me how I can solve for limits at infinity.',
    'hideText': 'Hide Examples'
  },
  'cosLimit': {
    'showText': 'Show me how.',
    'hideText': 'Hide Details'
  },
  'diffDemoHint': {
    'showText': "Give me some hints on what the value of f'(x) means.",
    'hideText': 'Hide Hints'
  },
  'diffDemoGraph': {
    'showText': 'Show graph of f(x) with tangent line',
    'hideText': 'Hide Graph'
  },
  'diffDemo2FormulaDiv': {
    'showText': "Show expression for f'(x)",
    'hideText': "Hide expression for f'(x)"
  },
  'diffDemo3FormulaDiv': {
    'showText': "Show expression for f'(x)",
    'hideText': "Hide expression for f'(x)"
  },
  'diffExampleOtherPtsP': {
    'showText': 'Show Slider',
    'hideText': 'Hide Slider'
  },
  'powerRuleProof': {
    'showText': 'Show me a proof of the power rule.',
    'hideText': 'Hide Power Rule Proof'
  },
  'sinCosDiffProof': {
    'showText': 'Prove the derivatives of sin(x) and cos(x).',
    'hideText': 'Hide Trig Derivative Proofs'
  },
  'expDiffProof': {
    'showText': 'Prove the derivatives of e^x and ln(x).',
    'hideText': 'Hide e^x and ln(x) Derivative Proofs'
  },
  'productRuleProof': {
    'showText': 'Show me a proof of the product rule.',
    'hideText': 'Hide Product Rule Proof'
  },
  'quotientRuleProof': {
    'showText': 'Prove the quotient rule using the chain rule.',
    'hideText': 'Hide Quotient Rule Proof'
  },
  'hopitalProof': {
    'showText': 'Prove a special case of L’Hôpital’s Rule.',
    'hideText': 'Hide Proof'
  },
  'invCosDetails': {
    'showText': 'Show me how.',
    'hideText': 'Hide Details'
  },
  'moreInverseTrig': {
    'showText': 'Show me the derivatives of more inverse functions.',
    'hideText': 'Hide Additional Trig Derivatives'
  },
  'diffIntervalsFunc': {
    'showText': 'Show value of f(x)',
    'hideText': 'Hide value of f(x)'
  },
  'concavityFunc': {
    'showText': 'Show value of f(x)',
    'hideText': 'Hide value of f(x)'
  },
  'lnDiffReveal': {
    'showText': 'Tell me the derivative!',
    'hideText': 'Hide Answer'
  },
  'riemannNotationCode': {
    'showText': 'I’m a programmer. Explain sigma notation with code!',
    'hideText': 'Hide Code'
  },
  'indefIntHint2': {
    'showText': 'Show me the graph!',
    'hideText': 'Hide Graph'
  },
  'indefIntReveal': {
    'showText': 'Show me the function!',
    'hideText': 'Hide Answer'
  },
  'indefInt2Reveal': {
    'showText': 'Show me the answers!',
    'hideText': 'Hide Answer'
  },
  'moreImproper': {
    'showText': 'Show me more examples of improper integrals!',
    'hideText': 'Hide Examples'
  },
  'logisticSolution': {
    'showText': 'Solve the logistic differential equation!',
    'hideText': 'Hide Solution'
  },
  'gravityEquation': {
    'showText': 'Where did that equation come from?',
    'hideText': 'Hide Explanation'
  },
  'vectorValuedDiffProof': {
    'showText': 'Show this with the limit definition of a derivative.',
    'hideText': 'Hide Proof'
  },
  'sinCosSquaredInt': {
    'showText': 'Show me how to solve those integrals.',
    'hideText': 'Hide Integrals'
  },
  'polarArea2Work1': {
    'showText': 'Show Full Work',
    'hideText': 'Hide Full Work'
  },
  'polarArea2Work2': {
    'showText': 'Show Full Work',
    'hideText': 'Hide Full Work'
  },
  'geometricSumProof': {
    'showText': 'Where does this formula come from?',
    'hideText': 'Hide Proof'
  },
  'geometricSigmaExplanation': {
    'showText': 'Why can this series be written like this?',
    'hideText': 'Hide Explanation'
  },
  'integralInequalityProof': {
    'showText': 'Why can we integrate both sides?',
    'hideText': 'Hide Explanation'
  },
  'integralAbsProof': {
    'showText': 'Why is this inequality true?',
    'hideText': 'Hide Explanation'
  },
  'powerSeriesIntWork': {
    'showText': 'Show Integral Work',
    'hideText': 'Hide Integral Work'
  },
  'leibnizPiHint2': {
    'showText': 'Give me another hint!',
    'hideText': 'Hide Hint 2'
  },
  'pSeriesProof': {
    'showText': 'Why is this true?',
    'hideText': 'Hide Proof'
  },
  'license': {
    'showText': 'Show License',
    'hideText': 'Hide License'
  },
  'altSeriesTestExplanation': {
    'showText': 'Why are these conditions necessary?',
    'hideText': 'Hide Explanation'
  }
};

const sliderSettings = {
  'demo': {
    'func': x => x * getSliderValue('demoB'),
    'sliderRange': [0, 10]
  },
  'demoB': {
    'func': x => x, // placeholder
    'sliderRange': [0, 10]
  },
  'limitsIntro1': {
    'func': x => 2 * x,
    'sliderRange': [0, 2]
  },
  'limitsIntro2': {
    'func': x => 2 * x,
    'sliderRange': [2, 4]
  },
  'limitsIntro3': {
    'func': x => x ** 2 / x,
    'sliderRange': [-2, 0]
  },
  'limitsIntro4': {
    'func': x => x ** 2 / x,
    'sliderRange': [0, 2]
  },
  'limitsIntro5': {
    'func': x => x === 2 ? 100 : 2 * x,
    'sliderRange': [0, 2]
  },
  'limitsIntro6': {
    'func': x => x === 2 ? 100 : 2 * x,
    'sliderRange': [2, 4]
  },
  'limitsNotExisting1L': {
    'func': x => Math.abs(x) / x,
    'sliderRange': [-1, 0]
  },
  'limitsNotExisting1R': {
    'func': x => Math.abs(x) / x,
    'sliderRange': [0, 1]
  },
  'limitsNotExisting2L': {
    'func': x => 1 / x,
    'sliderRange': [-1, 0]
  },
  'limitsNotExisting2R': {
    'func': x => 1 / x,
    'sliderRange': [0, 1]
  },
  'limitsNotExisting3L': {
    'func': x => Math.sin(1 / x),
    'sliderRange': [-0.5, 0]
  },
  'limitsNotExisting3R': {
    'func': x => Math.sin(1 / x),
    'sliderRange': [0, 0.5]
  },
  'oneSided1': {
    'func': x => x === 0 ? 1 : x > 0 ? x + 2 : x - 1,
    'sliderRange': [-1, 0]
  },
  'oneSided2': {
    'func': x => x === 0 ? 1 : x > 0 ? x + 2 : x - 1,
    'sliderRange': [0, 1]
  },
  'ivt': {
    'func': x => Math.cbrt(x - 1),
    'sliderRange': [0, 2]
  },
  'infLimits1': {
    'func': x => 1 / x ** 2,
    'sliderRange': [-1, 0]
  },
  'infLimits2': {
    'func': x => 1 / x ** 2,
    'sliderRange': [0, 1]
  },
  'infLimits3': {
    'func': x => 1 / x,
    'sliderRange': [-1, 0]
  },
  'infLimits4': {
    'func': x => 1 / x,
    'sliderRange': [0, 1]
  },
  'infLimits5': {
    'func': x => x - 3,
    'sliderRange': [2, 3]
  },
  'infLimits6': {
    'func': x => x - 3,
    'sliderRange': [3, 4]
  },
  'limAtInf': {
    'func': x => 1 / x,
    'sliderRange': [1, 1e6],
    'geometric': true,
    'inputPlaces': 3,
    'outputPlaces': 6
  },
  'squeeze': {
    'func': x => Math.sin(x) / x,
    'sliderRange': [-1, 1],
    'inputPlaces': 3,
    'outputPlaces': 4
  },
  'limitFormal': {
    'func': x => x,
    'sliderRange': [0, 2],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'limitFormal2': {
    'func': x => x ** 2,
    'sliderRange': [2.75, 3.25],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'diffExample': {
    'func': x => x ** 2,
    'sliderRange': [1, 3]
  },
  'diffExampleOtherPts': {
    'func': x => x ** 2,
    'sliderRange': [-4, 4]
  },
  'diffExampleOtherPts1st': {
    'func': x => x, // placeholder
    'sliderRange': [-3, 3],
    'forceUpdate': 'diffExampleOtherPts'
  },
  'diffExample2': {
    'func': x => 2 * x,
    'sliderRange': [-5, 5]
  },
  'limitDefGraph': {
    'func': x => x ** 2,
    'sliderRange': [1, 3]
  },
  'limitDefGraph2': {
    'func': x => x ** 2,
    'sliderRange': [1, 3]
  },
  'diffAbility1': {
    'func': x => Math.cbrt(x),
    'sliderRange': [-2, 2]
  },
  'diffAbility2': {
    'func': x => Math.abs(x),
    'sliderRange': [-2, 2]
  },
  'diffAbility3': {
    'func': x => x === 1 ? 3 : x,
    'sliderRange': [-5, 5]
  },
  'diffAbility4': {
    'func': x => x > 0 ? 1 : -1,
    'sliderRange': [-5, 5]
  },
  'diffAbility5': {
    'func': x => x === 0 ? 0 : 1 / x,
    'sliderRange': [-5, 5]
  },
  'diffDemo': {
    'func': x => 2 * x,
    'sliderRange': [-5, 5]
  },
  'diffDemo2': {
    'func': x => x, // placeholder
    'sliderRange': [-5, 5]
  },
  'diffDemo3': {
    'func': x => x, // placeholder
    'sliderRange': [-5, 5]
  },
  'diffSin': {
    'func': x => Math.cos(x),
    'sliderRange': [-2 * Math.PI, 2 * Math.PI]
  },
  'diffCos': {
    'func': x => -Math.sin(x),
    'sliderRange': [-2 * Math.PI, 2 * Math.PI]
  },
  'diffExpE': {
    'func': n => (1 + 1 / n) ** n,
    'sliderRange': [1, 1e7],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'diffExp': {
    'func': x => Math.exp(x),
    'sliderRange': [-3, 3]
  },
  'expDiffLimit1': {
    'func': h => (Math.exp(h) - 1) / h,
    'sliderRange': [0, 1]
  },
  'expDiffLimit2': {
    'func': h => (Math.exp(h) - 1) / h,
    'sliderRange': [-1, 0]
  },
  'diffLn': {
    'func': x => 1 / x,
    'sliderRange': [0, 4]
  },
  'diffChain2': {
    'func': x => x,
    'sliderRange': [0.01, 10]
  },
  'diffChain2Ln': {
    'func': x => x,
    'sliderRange': [0.01, 10]
  },
  'xToReciprocal': {
    'func': x => x ** (1/x),
    'sliderRange': [1, 1e7],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'localLinearity': {
    'func': x => 4 * (x - 2) + 4,
    'sliderRange': [1, 3],
    'inputPlaces': 3,
    'outputPlaces': 4
  },
  'localLinearity2': {
    'func': x => 0.1 * (x - 25) + 5,
    'sliderRange': [15, 35],
    'inputPlaces': 2,
    'outputPlaces': 4
  },
  'critPoints': {
    'func': x => 1 / (3 * Math.cbrt(x ** 2)) - 1,
    'sliderRange': [-1, 1]
  },
  'diffIntervals': {
    'func': x => -3 * x ** 2 + 1,
    'sliderRange': [-1, 1]
  },
  'diffIntervals2': {
    'func': x => -3 * x ** 2 + 1,
    'sliderRange': [-1, 1]
  },
  'concavity': {
    'func': x => -6 * x,
    'sliderRange': [-1, 1]
  },
  'optimization': {
    'func': w => (72 * w) / (w - 2) + 2 * w,
    'sliderRange': [2.001, 20]
  },
  'accumulationIntro': {
    'func': x => (x < 1) ? (2 * x) : (x < 2) ? ((x - 1) * 4 + 2) : ((x - 2) * 3 + 6),
    'sliderRange': [0, 3]
  },
  'gradeIntegral': {
    'func': t => 0.03 * t ** 3 + 2 * t,
    'sliderRange': [0, 4]
  },
  'riemannRight': {
    'func': n => riemannSum(x => x ** 2, [0, 2], n, 'right'),
    'sliderRange': [1, 1e7],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'riemannLeft': {
    'func': n => riemannSum(x => x ** 2, [0, 2], n, 'left'),
    'sliderRange': [1, 1e7],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'riemannMidpoint': {
    'func': n => riemannSum(x => x ** 2, [0, 2], n, 'midpoint'),
    'sliderRange': [1, 10000],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'riemannTrapezoid': {
    'func': n => riemannSum(x => x ** 2, [0, 2], n, 'trapezoid'),
    'sliderRange': [1, 10000],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'riemannAll': {
    'func': n => riemannSum(x => x ** 2, [0, 2], n, 'left'),
    'sliderRange': [1, 1e6],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'riemannLn': {
    'func': n => riemannSum(x => Math.log(x), [1, 100], n, 'right', true, 5e6, 'riemannLn'),
    'sliderRange': [1, 1e8],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6,
    'instantUpdate': false
  },
  'probability': {
    'func': n => riemannSum(x => Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI), [-1, 1], n, 'trapezoid'),
    'sliderRange': [1, 1000],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'ftc': {
    'func': x => x ** 3,
    'sliderRange': [0, 1],
    'inputPlaces': 3,
    'outputPlaces': 4
  },
  'ftcGraph': {
    'func': x => x ** 3,
    'sliderRange': [0, 1],
    'inputPlaces': 3,
    'outputPlaces': 4
  },
  'intInteractive': {
    'func': x => x ** 3,
    'sliderRange': [-5, 5],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'analyzeAccumulation': {
    'func': x => x ** 2 - 4,
    'sliderRange': [-4, 4],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'integralSum': {
    'func': x => -Math.cos(x) - (-Math.cos(0)),
    'sliderRange': [0, Math.PI],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'improperInt': {
    'func': b => -Math.exp(-b) + 1,
    'sliderRange': [0, 20],
    'inputPlaces': 3,
    'outputPlaces': 9
  },
  'improperInt2': {
    'func': a => 2 - 2 * Math.sqrt(a),
    'sliderRange': [1e-12, 1],
    'geometric': true,
    'inputPlaces': 12,
    'outputPlaces': 6
  },
  'improperInt3': {
    'func': b => -Math.cos(b) + 1,
    'sliderRange': [0, 20],
    'geometric': false,
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'improperInt4': {
    'func': a => 1 - Math.exp(a),
    'sliderRange': [-20, 0],
    'geometric': false,
    'inputPlaces': 3,
    'outputPlaces': 9
  },
  'improperInt5': {
    'func': b => Math.log(b),
    'sliderRange': [1, 1e6],
    'geometric': true,
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'improperInt6': {
    'func': b => -1 / b + 1,
    'sliderRange': [1, 1e6],
    'geometric': true,
    'inputPlaces': 3,
    'outputPlaces': 6
  },
  'gammaFunc': {
    'func': x => x, // placeholder
    'sliderRange': [0.1, 100],
    'geometric': true,
    'inputPlaces': 2,
    'forceUpdate': 'gammaFuncXValue'
  },
  'gammaFuncXValue': {
    'func': x => x, // placeholder, the actual code to use the gammaIntegral function is implemented in updateSliderValues
    'sliderRange': [-2, 10],
    'inputPlaces': 2,
    'outputPlaces': 5,
    'maxSigFigs': 10
  },
  'gammaFunc2': {
    'func': x => math.gamma(x),
    'sliderRange': [-10, 10],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'maxSigFigs': 10
  },
  'gammaFuncComplex': {
    'func': x => x, // placeholder
    'sliderRange': [-10, 10],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'maxSigFigs': 10
  },
  'gammaFuncComplexImag': {
    'func': x => x, // placeholder
    'sliderRange': [-10, 10],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'maxSigFigs': 10,
    'forceUpdate': 'gammaFuncComplex'
  },
  'riemannZeta': {
    'func': x => x, // placeholder
    'sliderRange': [-10, 10],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'maxSigFigs': 10
  },
  'riemannZetaImag': {
    'func': x => x, // placeholder
    'sliderRange': [-10, 10],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'maxSigFigs': 10,
    'forceUpdate': 'riemannZeta'
  },
  'arcLength': {
    'func': n => arcLength(x => x ** (3/2), [0, 2], n),
    'sliderRange': [1, 10000],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'polarArea': {
    'func': n => 0.5 * riemannSum(theta => (1 + Math.sin(theta)) ** 2, [0, Math.PI / 2], n, 'left'),
    'sliderRange': [1, 1e7],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 6
  },
  'geoSeriesInteractiveRatio': {
    'func': x => x, // placeholder
    'sliderRange': [-1.5, 1.5],
    'forceUpdate': 'geoSeriesInteractive',
    'inputPlaces': 2,
    'outputPlaces': 6
  },
  'nthTermHarmonic2': {
    'func': n => n * Math.log(10) + eulersConstant,
    'sliderRange': [7, 1e9],
    'geometric': true,
    'inputPlaces': 0,
    'outputPlaces': 3
  },
  'pSeriesPValue': {
    'func': x => x, // the function is unnecessary so this is used as a placeholder
    'sliderRange': [-0.5, 2.5],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'forceUpdate': 'pSeries'
  },
  'maclaurinIntro': {
    'func': x => taylorApprox(1, 'sin', x),
    'sliderRange': [1, 13],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'lagrangeError1': {
    'func': x => taylorApprox(1, 'sin', x),
    'sliderRange': [1, 14],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'lagrangeError2': {
    'func': x => taylorApprox(1.5, 'ln', x),
    'sliderRange': [1, 20],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'powerSeriesXValue': {
    'func': x => x,
    'sliderRange': [0, 6],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'forceUpdate': 'powerSeries'
  },
  'taylorSin': {
    'func': x => taylorApprox(round(parseFloat(get('taylorSinXValueSlider').value) * 2 * Math.PI - Math.PI, 2), 'sin', x),
    'sliderRange': [1, 19],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'taylorSinXValue': {
    'func': x => x,
    'sliderRange': [-Math.PI, Math.PI],
    'inputPlaces': 2,
    'outputPlaces': 10,
    'forceUpdate': 'taylorSin'
  },
  'taylorCos': {
    'func': x => taylorApprox(round(parseFloat(get('taylorCosXValueSlider').value) * 2 * Math.PI - Math.PI, 2), 'cos', x),
    'sliderRange': [1, 20],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'taylorCosXValue': {
    'func': x => x,
    'sliderRange': [-Math.PI, Math.PI],
    'inputPlaces': 2,
    'outputPlaces': 10,
    'forceUpdate': 'taylorCos'
  },
  'taylorExp': {
    'func': x => taylorApprox(round(parseFloat(get('taylorExpXValueSlider').value) * 10 - 5, 2), 'exp', x),
    'sliderRange': [0, 20],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'taylorExpXValue': {
    'func': x => x,
    'sliderRange': [-5, 5],
    'inputPlaces': 2,
    'outputPlaces': 10,
    'forceUpdate': 'taylorExp'
  },
  'taylorLn': {
    'func': x => taylorApprox(round(getSliderValue('taylorLnXValue'), 2), 'ln', x),
    'sliderRange': [1, 20],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'taylorLnXValue': {
    'func': x => x,
    'sliderRange': [-1, 3],
    'inputPlaces': 2,
    'outputPlaces': 10,
    'forceUpdate': 'taylorLn'
  },
  'taylorSinh': {
    'func': x => taylorApprox(round(parseFloat(get('taylorSinhXValueSlider').value) * 10 - 5, 2), 'sinh', x),
    'sliderRange': [1, 19],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'taylorSinhXValue': {
    'func': x => x,
    'sliderRange': [-5, 5],
    'inputPlaces': 2,
    'outputPlaces': 10,
    'forceUpdate': 'taylorSinh'
  },
  'taylorCosh': {
    'func': x => taylorApprox(round(parseFloat(get('taylorCoshXValueSlider').value) * 10 - 5, 2), 'cosh', x),
    'sliderRange': [1, 20],
    'inputPlaces': 0,
    'outputPlaces': 10
  },
  'taylorCoshXValue': {
    'func': x => x,
    'sliderRange': [-5, 5],
    'inputPlaces': 2,
    'outputPlaces': 10,
    'forceUpdate': 'taylorCosh'
  },
  'powerSeriesFuncXValue': {
    'func': x => x,
    'sliderRange': [-1, 1],
    'inputPlaces': 2,
    'outputPlaces': 6,
    'forceUpdate': 'powerSeriesFunc'
  },
  'eulersFormula1': {
    'func': b => 2 ** b,
    'sliderRange': [-5, 5],
    'inputPlaces': 0,
    'outputPlaces': 5
  },
  'eulersFormulaReal': {
    'func': b => 2 ** b,
    'sliderRange': [-5, 5],
    'inputPlaces': 3,
    'outputPlaces': 6
  },
  'eulersFormula5': {
    'func': x => math.exp(math.complex(0, x)),
    'sliderRange': [0, 2 * Math.PI],
    'inputPlaces': 2,
    'outputPlaces': 4
  },
  'hyperIntroCircle': {
    'func': x => Math.sin(x),
    'sliderRange': [0, 2 * Math.PI],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'hyperIntro': {
    'func': x => Math.sinh(x),
    'sliderRange': [-2, 2],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'partialDiffX': {
    'func': x => x ** 2 * 2,
    'sliderRange': [-10, 10],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'partialDiffY': {
    'func': y => 4 * y,
    'sliderRange': [-10, 10],
    'inputPlaces': 3,
    'outputPlaces': 3
  },
  'maclaurinPlayground': {
    'func': x => x,
    'sliderRange': [-5, 5],
    'inputPlaces': 3,
    'outputPlaces': 10
  },
  'maclaurinPlaygroundDegree': {
    'func': x => x,
    'sliderRange': [1, 20],
    'inputPlaces': 0,
    'outputPlaces': 0
  }
};

const sequenceSettings = {
  // Sequence displayers and partial sum sliders
  'infSeriesIntro1': {
    'rule': n => (1/2) ** n,
    'places': 6
  },
  'infSeriesIntro2': {
    'rule': n => (-1) ** n,
    'places': 0
  },
  'infSeriesConvergent1': {
    'rule': n => 1 / n,
    'places': 6
  },
  'infSeriesConvergent2': {
    'rule': n => (10 * n ** 3 + 3) / (2 * n ** 3 + n ** 2),
    'places': 6
  },
  'infSeriesConvergent3': {
    'rule': n => 1 + 100 / factorial(n),
    'places': 6
  },
  'infSeriesDivergent1': {
    'rule': n => n,
    'places': 0
  },
  'infSeriesDivergent2': {
    'rule': n => Math.sin(n),
    'places': 6
  },
  'infSeriesDivergent3': {
    'rule': n => (-2) ** n,
    'places': 6
  },
  'partialSum1': {
    'rule': n => 4 / ((n + 4) * (n + 3)),
    'sliderRange': [1, 20],
    'places': 6
  },
  'infSeriesIntro3': {
    'rule': n => (1/2) ** n,
    'partialSum': n => 1 - (1/2) ** n,
    'sliderRange': [1, 20],
    'places': 6,
    'displayAsFraction': true
  },
  'infSeriesIntro4': {
    'rule': n => 2 ** (n - 1),
    'partialSum': n => 2 ** n - 1,
    'sliderRange': [1, 30],
    'places': 0
  },
  'infSeriesOscillate': {
    'rule': n => (-1) ** (n + 1),
    'partialSum': n => n % 2,
    'sliderRange': [1, 20],
    'places': 0
  },
  'geoSeries': {
    'rule': n => 2 * 0.6 ** (n - 1),
    'partialSum': n => 2 * (1 - (0.6) ** n) / 0.4,
    'sliderRange': [1, 30],
    'places': 6
  },
  'geoSeries2': {
    'rule': n => (-2) ** (n - 1),
    'partialSum': n => (1 - (-2) ** n) / 3,
    'sliderRange': [1, 30],
    'places': 0
  },
  'geoSeriesGame': {
    'rule': n => 100 * 0.75 ** (n - 1),
    'partialSum': n => 100 * (1 - (0.75) ** n) / 0.25,
    'sliderRange': [1, 45],
    'places': 3
  },
  'geoSeriesInteractive': {
    'rule': n => round(getSliderValue('geoSeriesInteractiveRatio'), 2) ** (n - 1),
    'partialSum': n => round(getSliderValue('geoSeriesInteractiveRatio'), 2) === 1 ? n : (1 - round(getSliderValue('geoSeriesInteractiveRatio'), 2) ** n) / (1 - round(getSliderValue('geoSeriesInteractiveRatio'), 2)),
    'sliderRange': [1, 100],
    'geometric': true,
    'places': 6,
    'maxSigFigs': 10
  },
  'nthTermTest': {
    'rule': n => 1 + (1/2) ** (n - 1),
    'partialSum': n => n + (1 - (1/2) ** n) / 0.5,
    'sliderRange': [1, 1e5],
    'geometric': true,
    'places': 6,
    'seriesVisual': true
  },
  'nthTermTest2': {
    'rule': n => (2 * n ** 2 + 3) / (n ** 2 + 4 * n),
    'sliderRange': [1, 1e5],
    'geometric': true,
    'places': 6,
    'seriesVisual': true
  },
  'nthTermTest3': {
    'rule': n => Math.log(n),
    'sliderRange': [1, 1e5],
    'geometric': true,
    'places': 6,
    'seriesVisual': true
  },
  'nthTermTest4': {
    'rule': n => Math.cos(n),
    'sliderRange': [1, 50],
    'geometric': false,
    'places': 6,
    'seriesVisual': true
  },
  'nthTermTest5': {
    'rule': n => 3 + 1/n,
    'sliderRange': [1, 1e5],
    'geometric': true,
    'places': 6,
    'seriesVisual': true
  },
  'nthTermHarmonic': {
    'rule': n => 1 / n,
    'partialSum': harmonicSum,
    'sliderRange': [1, 1e7],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'integralTest1': {
    'rule': n => 1 / n,
    'partialSum': harmonicSum,
    'sliderRange': [1, 1e7],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'integralTest2': {
    'rule': n => 1 / (n + 1) ** 2,
    'sliderRange': [1, 1e6 - 1],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'eulersConstant': {
    'rule': n => 1 / n,
    'partialSum': harmonicSum,
    'sliderRange': [1, 1e7],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'pSeries': {
    'rule': n => 1 / (n ** (round(getSliderValue('pSeriesPValue'), 2))),
    'partialSum': pSeriesSum,
    'sliderRange': [1, 1e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'comparisonTest': {
    'rule': n => 1 / n,
    'partialSum': harmonicSum,
    'ruleB': n => 1 / 2 ** Math.ceil(Math.log2(n)),
    'partialSumB': n => 1 + 0.5 * Math.floor(Math.log2(n)) + 0.5 * (n - 2 ** Math.floor(Math.log2(n))) / 2 ** Math.floor(Math.log2(n)),
    'sliderRange': [1, 1e7],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'comparisonTest2': {
    'rule': n => 1 / 3 ** n,
    'partialSum': n => 1/3 * (1 - (1/3) ** n) / (2/3),
    'ruleB': n => 1 / (3 ** n + 1),
    'partialSumB': slowPartialSum(n => 1 / (3 ** n + 1)),
    'sliderRange': [1, 20],
    'geometric': false,
    'places': 6,
    'displayAsFraction': true
  },
  'comparisonTest3': {
    'rule': n => 1 / 3 ** n,
    'partialSum': n => 1/3 * (1 - (1/3) ** n) / (2/3),
    'ruleB': n => 1 / (3 ** n - 1),
    'partialSumB': slowPartialSum(n => 1 / (3 ** n - 1)),
    'sliderRange': [1, 20],
    'geometric': false,
    'places': 6,
    'displayAsFraction': true
  },
  'telescoping': {
    'rule': n => 1 / (n * (n + 1)),
    'sliderRange': [1, 1e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'telescoping2': {
    'rule': n => (1 / n) - (1 / (n + 2)),
    'sliderRange': [1, 1e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': false
  },
  'altSeries1': {
    'rule': n => (-1) ** (n+1) / n,
    'partialSum': altHarmonicSum,
    'sliderRange': [1, 5e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'altSeries2': {
    'rule': n => (-3/2) ** n,
    'partialSum': n => (-3/2) * (1 - (-3/2) ** n) / (5/2),
    'sliderRange': [1, 30],
    'geometric': false,
    'places': 3,
    'displayAsFraction': false
  },
  'altSeries3': {
    'rule': n => (-1) ** (n+1) * (1 + (1/2) ** n),
    'partialSum': slowPartialSum(n => (-1) ** (n+1) * (1 + (1/2) ** n)),
    'sliderRange': [1, 30],
    'geometric': false,
    'places': 6,
    'displayAsFraction': false
  },
  'altSeries4': {
    'rule': n => (-1) ** (n+1) * (1 / factorial(2 * (n - 1))),
    'partialSum': slowPartialSum(n => (-1) ** (n+1) * (1 / factorial(2 * (n - 1)))),
    'sliderRange': [1, 10],
    'geometric': false,
    'places': 10,
    'displayAsFraction': true
  },
  'altSeries5': {
    'rule': n => (-1) ** n * (n+5) / (n ** 2),
    'partialSum': slowPartialSum(n => (-1) ** n * (n+5) / (n ** 2)),
    'sliderRange': [1, 5e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': false
  },
  'altSeriesDivergent1': {
    'rule': n => (n % 2 === 1 ? 2 : -1) / Math.ceil(n / 2),
    'sliderRange': [1, 5e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': false
  },
  'altSeriesDivergent2': {
    'rule': n => (-1) ** (n - 1),
    'sliderRange': [1, 20],
    'geometric': false,
    'places': 6,
    'displayAsFraction': false
  },
  'altSeriesDivergent3': {
    'rule': n => (-1) ** (n - 1) * (0.5 + 0.5 ** (n - 1)),
    'sliderRange': [1, 20],
    'geometric': false,
    'places': 6,
    'displayAsFraction': false
  },
  'ratioTest1': {
    'rule': n => (2 / 3) ** n / n,
    'partialSum': slowPartialSum(n => (2 / 3) ** n / n),
    'sliderRange': [1, 1000],
    'geometric': true,
    'places': 6,
    'displayAsFraction': false,
    'endingTerms': 2
  },
  'ratioTest2': {
    'rule': n => factorial(n) / (10 ** n),
    'partialSum': slowPartialSum(n => factorial(n) / (10 ** n)),
    'sliderRange': [1, 40],
    'geometric': false,
    'places': 6,
    'maxSigFigs': 10,
    'displayAsFraction': false,
    'endingTerms': 2
  },
  'rootTest1': {
    'rule': n => (2 ** n) / (n ** n),
    'sliderRange': [1, 200],
    'geometric': true,
    'places': 6,
    'displayAsFraction': false,
    'endingTerms': 2
  },
  'rootTest2': {
    'rule': n => (-2) ** n / n,
    'sliderRange': [1, 1000],
    'geometric': true,
    'places': 6,
    'maxSigFigs': 10,
    'displayAsFraction': false,
    'endingTerms': 2
  },
  'absConvergence1': {
    'rule': n => (-1) ** (n + 1) / n,
    'partialSum': slowPartialSum(n => (-1) ** (n + 1) / n),
    'ruleB': n => 1 / n,
    'partialSumB': harmonicSum,
    'sliderRange': [1, 5e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'absConvergence2': {
    'rule': n => (-1/2) ** n,
    'partialSum': slowPartialSum(n => (-1/2) ** n),
    'ruleB': n => (1/2) ** n,
    'partialSumB': slowPartialSum(n => (1/2) ** n),
    'sliderRange': [1, 20],
    'geometric': false,
    'places': 6,
    'displayAsFraction': true
  },
  'absConvergence3': {
    'rule': n => ((-1) ** n * (n+5)) / (n ** 2),
    'partialSum': slowPartialSum(n => ((-1) ** n * (n+5)) / (n ** 2)),
    'ruleB': n => (n+5) / (n ** 2),
    'partialSumB': slowPartialSum(n => (n+5) / (n ** 2)),
    'sliderRange': [1, 5e6],
    'geometric': true,
    'places': 6,
    'displayAsFraction': false
  },
  'altError1': {
    'rule': n => (-1) ** (n+1) / n,
    'partialSum': altHarmonicSum,
    'sliderRange': [1, 1e5],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'altError2': {
    'rule': n => (-1) ** (n+1) / (n ** 3),
    'partialSum': slowPartialSum(n => (-1) ** (n+1) / (n ** 3)),
    'sliderRange': [1, 200],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'integralError1': {
    'rule': n => 1 / n ** 2,
    'sliderRange': [1, 1000],
    'geometric': true,
    'places': 6,
    'displayAsFraction': true
  },
  'powerSeries': {
    'rule': n => ((n - 1) * (round(parseFloat(get('powerSeriesXValueSlider').value) * 6, 2) - 3) ** (n - 1)) / (2 ** (n - 1) * n),
    'partialSum': terms => {
      var x = round(parseFloat(get('powerSeriesXValueSlider').value) * 6, 2);
      var sum = 0;
      for (var n = 0; n <= terms - 1; n++) {
        sum += (n * (x - 3) ** n) / (2 ** n * (n + 1));
      }
      return sum;
    },
    'sliderRange': [1, 100],
    'geometric': false,
    'places': 6,
    'maxSigFigs': 12,
    'displayAsFraction': false
  },
  'taylorCos2Pi': {
    'rule': n => (-1) ** (n-1) * (2 * Math.PI) ** (2 * (n-1)) / factorial(2 * (n-1)),
    'partialSum': slowPartialSum(n => (-1) ** (n-1) * (2 * Math.PI) ** (2 * (n-1)) / factorial(2 * (n-1))),
    'sliderRange': [1, 15],
    'geometric': false,
    'places': 6,
    'displayAsFraction': false
  },
  'powerSeriesFunc': {
    'rule': n => 10 * (-2 * round(parseFloat(get('powerSeriesFuncXValueSlider').value) * 2 - 1, 2) ** 2) ** (n - 1),
    'partialSum': terms => {
      var x = round(parseFloat(get('powerSeriesFuncXValueSlider').value) * 2 - 1, 2);
      var sum = 0;
      for (var n = 0; n <= terms - 1; n++) {
        sum += 10 * (-2 * x ** 2) ** n;
      }
      return sum;
    },
    'sliderRange': [1, 100],
    'geometric': false,
    'places': 6,
    'displayAsFraction': false
  },
  'leibnizPi': {
    'rule': n => (-1) ** (n - 1) * 4 / (2 * n - 1),
    'partialSum': terms => {
      // optimized Leibniz partial sum algorithm
      var sum = 0;
      var lastN = Math.floor(terms / 2) * 4 - 3;
      for (var n = 1; n <= lastN; n += 4) {
        // calculate pairs of terms at once
        sum += 8 / (n * (n + 2));
      }
      if (terms % 2 === 1) {
        // add last term if needed
        sum += 4 / (2 * terms - 1);
      }
      return sum;
    },
    'sliderRange': [1, 1e7],
    'geometric': true,
    'places': 6,
    'termDisplayRule': n => n % 2 === 1 ? `+4/${formatNum(2 * n - 1)}` : `-4/${formatNum(2 * n - 1)}` 
  },
  'eulersFormula2': {
    'rule': n => 2 ** (n - 1) / factorial(n - 1),
    'partialSum': n => taylorApprox(2, 'exp', n - 1),
    'sliderRange': [1, 15],
    'geometric': false,
    'places': 6,
    'termDisplayRule': n => n === 1 ? '+1' : n === 2 ? '+2' : `+2^${n - 1}/${n - 1}!`
  },
  'eulersFormula3': {
    'rule': n => math.divide(math.pow(math.complex('i'), n - 1), factorial(n - 1)),
    'partialSum': n => taylorApprox(math.complex('i'), 'exp', n - 1),
    'sliderRange': [1, 15],
    'geometric': false,
    'places': 6,
    'termDisplayRule': n => n === 1 ? '+1' : n === 2 ? '+i' : `+i^${n - 1}/${n - 1}!`
  },
  'eulersFormula4': {
    'rule': n => math.divide(math.pow(math.complex('3+2i'), n - 1), factorial(n - 1)),
    'partialSum': n => taylorApprox(math.complex('3+2i'), 'exp', n - 1),
    'sliderRange': [1, 20],
    'geometric': false,
    'places': 6,
    'termDisplayRule': n => n === 1 ? '+1' : n === 2 ? '+(3+2i)' : `+(3+2i)^${n - 1}/${n - 1}!`
  }
};

const graphSettings = {
  // Canvas graphs
  'circleAnimationGraph': {
    'func': t => ((Math.sin(t) + 1) / 2 * 1.2) - 0.1,
    'derivative': t => Math.cos(t) / 2 * 1.2,
    'xBounds': [0, 2 * Math.PI],
    'yBounds': [-0.6, 1.6]
  },
  'limitsIntro1': {
    'func': x => 2 * x,
    'xBounds': [-10, 10],
    'yBounds': [-10, 10]
  },
  'limitsIntro2': {
    'func': x => 2 * x,
    'xBounds': [-10, 10],
    'yBounds': [-10, 10]
  },
  'limitsIntro3': {
    'func': x => x ** 2 / x,
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'limitsIntro4': {
    'func': x => x ** 2 / x,
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'diffExample': {
    'func': x => x ** 2,
    'pointX': 2,
    'xBounds': [-6, 6],
    'yBounds': [-1, 11]
  },
  'diffExampleOtherPts': {
    'func': x => x ** 2,
    'xBounds': [-6, 6],
    'yBounds': [-1, 11]
  },
  'diffExample2': {
    'func': x => x ** 2,
    'derivative': x => 2 * x,
    'xBounds': [-9, 9],
    'yBounds': [-2, 16]
  },
  'limitDefGraph': {
    'func': x => x ** 2,
    'pointX': 2,
    'xBounds': [-6, 6],
    'yBounds': [-2, 10]
  },
  'limitDefGraph2': {
    'func': x => x ** 2,
    'pointX': 2,
    'xBounds': [-6, 6],
    'yBounds': [-2, 10]
  },
  'diffDemo': {
    'func': x => x ** 2,
    'derivative': x => 2 * x,
    'xBounds': [-9, 9],
    'yBounds': [-2, 16]
  },
  'diffDemo2': {
    'func': x => x ** 2, // placeholder
    'derivative': x => 2 * x, // placeholder
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'diffDemo3': {
    'func': x => x ** 2, // placeholder
    'derivative': x => 2 * x, // placeholder
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'diffSin': {
    'func': x => Math.sin(x),
    'derivative': x => Math.cos(x),
    'xBounds': [-2 * Math.PI, 2 * Math.PI],
    'yBounds': [-2 * Math.PI, 2 * Math.PI]
  },
  'diffCos': {
    'func': x => Math.cos(x),
    'derivative': x => -Math.sin(x),
    'xBounds': [-2 * Math.PI, 2 * Math.PI],
    'yBounds': [-2 * Math.PI, 2 * Math.PI]
  },
  'diffExp': {
    'func': x => Math.exp(x),
    'derivative': x => Math.exp(x),
    'xBounds': [-3, 3],
    'yBounds': [-1, 5]
  },
  'diffLn': {
    'func': x => Math.log(x),
    'derivative': x => 1 / x,
    'xBounds': [-1, 4],
    'yBounds': [-2.5, 2.5]
  },
  'diffAbility1': {
    'func': x => Math.cbrt(x),
    'pointX': 0,
    'xBounds': [-2, 2],
    'yBounds': [-2, 2]
  },
  'diffAbility2': {
    'func': x => Math.abs(x),
    'pointX': 0,
    'xBounds': [-2, 2],
    'yBounds': [-2, 2]
  },
  'diffAbility3': {
    'func': x => x === 1 ? 3 : x,
    'pointX': 1,
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'diffAbility4': {
    'func': x => x > 0 ? 1 : -1,
    'pointX': 0,
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'diffAbility5': {
    'func': x => x === 0 ? 0 : 1 / x,
    'pointX': 0,
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'localLinearity': {
    'func': x => x ** 2,
    'xBounds': [1, 3],
    'yBounds': [0, 9]
  },
  'localLinearity2': {
    'func': x => Math.sqrt(x),
    'xBounds': [15, 35],
    'yBounds': [Math.sqrt(15), 6]
  },
  'critPoints': {
    'func': x => Math.cbrt(x) - x,
    'derivative': x => 1 / (3 * Math.cbrt(x ** 2)) - 1,
    'xBounds': [-1, 1],
    'yBounds': [-1, 1]
  },
  'diffIntervals': {
    'func': x => -(x ** 3) + x,
    'derivative': x => -3 * x ** 2 + 1,
    'xBounds': [-2, 2],
    'yBounds': [-2, 2]
  },
  'diffIntervals2': {
    'func': x => -(x ** 3) + x,
    'derivative': x => -3 * x ** 2 + 1,
    'xBounds': [-2, 2],
    'yBounds': [-2, 2]
  },
  'concavity': {
    'func': x => -(x ** 3) + x,
    'derivative': x => -3 * x ** 2 + 1,
    'xBounds': [-2, 2],
    'yBounds': [-2, 2]
  },
  'accumulationIntro': {
    'func': x => [2, 4, 3][Math.min(Math.floor(x), 2)],
    'xBounds': [0, 3],
    'yBounds': [-0.1, 4.1]
  },
  'gradeIntegral': {
    'func': t => t >= 0 ? 0.09 * t ** 2 + 2 : NaN,
    'xBounds': [-0.05, 4],
    'yBounds': [-0.05, 4]
  },
  'riemannRight': {
    'func': x => x ** 2,
    'xBounds': [-0.025, 2.025],
    'yBounds': [-0.05, 4.05]
  },
  'riemannLeft': {
    'func': x => x ** 2,
    'xBounds': [-0.025, 2.025],
    'yBounds': [-0.05, 4.05]
  },
  'riemannMidpoint': {
    'func': x => x ** 2,
    'xBounds': [-0.025, 2.025],
    'yBounds': [-0.05, 4.05]
  },
  'riemannTrapezoid': {
    'func': x => x ** 2,
    'xBounds': [-0.025, 2.025],
    'yBounds': [-0.05, 4.05]
  },
  'probability': {
    'func': x => Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI),
    'xBounds': [-2, 2],
    'yBounds': [-0.05, 0.4]
  },
  'integralSum': {
    'func': x => Math.sin(x),
    'xBounds': [-0.2, Math.PI + 0.2],
    'yBounds': [-Math.PI/2 - 0.2, Math.PI/2 + 0.2]
  },
  'analyzeAccumulation': {
    'func': x => x ** 2 - 4,
    'xBounds': [-5, 5],
    'yBounds': [-10, 10]
  },
  'ftc': {
    'func': x => 3 * x ** 2,
    'xBounds': [-0.5, 1.5],
    'yBounds': [-1, 4]
  },
  'ftcGraph': {
    'func': x => 3 * x ** 2,
    'xBounds': [-0.5, 1.5],
    'yBounds': [-1, 4]
  },
  'intInteractive': {
    'func': x => x, // placeholder
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'eulersFormula5': {
    'xBounds': [-1.5, 1.5],
    'yBounds': [-1.5, 1.5]
  },
  'hyperIntroCircle': {
    'xBounds': [-1.5, 1.5],
    'yBounds': [-1.5, 1.5]
  },
  'hyperIntro': {
    'xBounds': [-4, 4],
    'yBounds': [-4, 4]
  },
  'infSeriesIntro3': {
    'xBounds': [0, 1],
    'yBounds': [-1, 1]
  },
  'infSeriesIntro4': {
    'xBounds': [0, 1e6],
    'yBounds': [-1, 1]
  },
  'infSeriesOscillate': {
    'xBounds': [-1, 1],
    'yBounds': [-1, 1]
  },
  'geoSeries': {
    'xBounds': [0, 5],
    'yBounds': [-1, 1]
  },
  'geoSeries2': {
    'xBounds': [-1e6, 1e6],
    'yBounds': [-1, 1]
  },
  'geoSeriesInteractive': {
    'xBounds': [-1, 1], // placeholder
    'yBounds': [-1, 1]
  },
  'nthTermHarmonic': {
    'xBounds': [0, 15],
    'yBounds': [-1, 1]
  },
  'comparisonTest': {
    'xBounds': [0, 15],
    'yBounds': [-1, 1]
  },
  'integralTest1': {
    'xBounds': [0, 15],
    'yBounds': [-1, 1]
  },
  'integralTest2': {
    'xBounds': [0, 1],
    'yBounds': [-1, 1]
  },
  'altSeries1': {
    'xBounds': [0, 1],
    'yBounds': [-1, 1]
  },
  'altSeries2': {
    'xBounds': [-1000, 1000],
    'yBounds': [-1, 1]
  },
  'altSeries3': {
    'xBounds': [0, 2],
    'yBounds': [-1, 1]
  },
  'altSeries4': {
    'xBounds': [0, 1],
    'yBounds': [-1, 1]
  },
  'altSeries5': {
    'xBounds': [-6, 0],
    'yBounds': [-1, 1]
  },
  'altSeriesDivergent1': {
    'xBounds': [0, 15],
    'yBounds': [-1, 1]
  },
  'altSeriesDivergent2': {
    'xBounds': [-1, 1],
    'yBounds': [-1, 1]
  },
  'altSeriesDivergent3': {
    'xBounds': [0, 2],
    'yBounds': [-1, 1]
  },
  'maclaurinPlayground': {
    'xBounds': [-5, 5],
    'yBounds': [-5, 5]
  },
  'improperInt': {
    'func': x => Math.exp(-x),
    'xBounds': [-0.1, 8],
    'yBounds': [-0.1, 1.1]
  },
  'improperInt2': {
    'func': x => 1 / Math.sqrt(x),
    'xBounds': [-0.1, 1.1],
    'yBounds': [-0.1, 5]
  },
  'improperInt3': {
    'func': x => Math.sin(x),
    'xBounds': [-0.5, 4 * Math.PI],
    'yBounds': [-(2 * Math.PI + 0.25), 2 * Math.PI + 0.25]
  },
  'improperInt4': {
    'func': x => Math.exp(x),
    'xBounds': [-8, 0.1],
    'yBounds': [-0.1, 1.1]
  },
  'improperInt5': {
    'func': x => 1 / x,
    'xBounds': [0.5, 25],
    'yBounds': [-0.1, 1.1]
  },
  'improperInt6': {
    'func': x => 1 / x ** 2,
    'xBounds': [0.5, 25],
    'yBounds': [-0.1, 1.1]
  },
  'gammaFuncXValue': {
    'func': x => x, // placeholder
    'xBounds': [-1, 15],
    'yBounds': [-0.5, 10]
  },
  'gammaFunc2': {
    'func': x => math.gamma(x), // placeholder
    'xBounds': [-4.01, 5],
    'yBounds': [-15, 15]
  },
  'nthTermTest': {
    'xBounds': [0, 10000],
    'yBounds': [-1, 1]
  },
  'nthTermTest2': {
    'xBounds': [0, 10000],
    'yBounds': [-1, 1]
  },
  'nthTermTest3': {
    'xBounds': [0, 10000],
    'yBounds': [-1, 1]
  },
  'nthTermTest4': {
    'xBounds': [-2, 2],
    'yBounds': [-1, 1]
  },
  'nthTermTest5': {
    'xBounds': [0, 10000],
    'yBounds': [-1, 1]
  }
};

const taylorFuncs = {
  'sin': x => Math.sin(x),
  'cos': x => Math.cos(x),
  'exp': x => Math.exp(x),
  'ln': x => Math.log(x),
  'sinh': x => Math.sinh(x),
  'cosh': x => Math.cosh(x),
  'reciprocal': x => 1 / x,
  'geometric': x => 1 / (1 - x),
}

// Initialize canvas and ctx variables for each graph
for (var id in graphSettings) {
  var canvas = get(id + 'Canvas');
  if (canvas !== null) {
    graphSettings[id]['canvas'] = canvas;
    graphSettings[id]['ctx'] = canvas.getContext('2d');
  }
}

// I use this variable during debugging to count how many times a function is called
var counter = 0;

// Helper functions
function get(element) {
  return document.getElementById(element);
}

function getClassElements(classNames) {
  // classNames can be an array or a single class name
  if (!Array.isArray(classNames)) {
    classNames = [classNames];
  }
  var classElements = [];
  for (var className of classNames) {
    for (var element of document.getElementsByClassName(className)) {
      classElements.push(element);
    }
  }
  return classElements;
}

// Returns whether the given elements exist
function elementsExist(ids) {
  // ids can be an array or a single element id
  if (!Array.isArray(ids)) {
    // Single element
    return get(ids) !== null;
  }
  // Array of elements
  for (var id of ids) {
    if (get(id) === null) {
      return false;
    }
  }
  return true;
}

function removeFromArray(array, value) {
  // Returns whether or not a value was actually removed
  var index = array.indexOf(value);
  if (index !== -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

function coloredText(color, text) {
  if (darkModeEnabled) {
    return `<span class="${color}-dark-mode">${text}</span>`;
  }
  return `<span class="${color}">${text}</span>`;
}

function setText(id, text) {
  if (elementsExist(id)) {
    get(id).innerText = text;
  }
}

// Functions that handle hiding and showing elements
function isHidden(element) {
  var classList = get(element).classList;
  return classList.contains('hidden') || classList.contains('hidden-by-default');
}

function jumpTo(element) {
  if (!elementsExist(element)) {
    return;
  }
  var header = element + 'Header';
  var parentElement = get(element).parentElement;
  var unit = parentElement.id;
  if (parentElement.tagName !== 'BODY' && !get(unit).classList.contains('unit')) {
    // This is VERY counterintuitive but we only want to show the unit if it isn’t the parent element containing both the unit and the header
    // This allows the function to work with entire units, not just sections
    showElement(unit);
  }
  if (unitElementIDs.includes(unit + 'Unit')) {
    typesetUnit(unit);
  }
  else if (unitElementIDs.includes(unit)) {
    typesetUnit(unit.replace(/Unit$/, ''));
  }
  showElement(element);
  get(header).scrollIntoView();
}

function saveHiddenElements() {
  localStorage.setItem('hiddenElements', JSON.stringify(hiddenElements));
}

function saveShownElements() {
  localStorage.setItem('shownElements', JSON.stringify(shownElements));
}

function getSectionsInUnit(unit) {
  var sections = [];
  for (var element of get(unit).querySelectorAll(':scope > div')) {
    if (element.id !== '') {
      sections.push(element.id);
    }
  }
  return sections;
}

function showElement(element, button=null, hideText='Hide', save=true) {
  if (button === null) {
    button = element + 'Button';
  }
  
  if (get(element) === null) {
    // Element doesn't exist; something went wrong
    return;
  } 

  get(element).classList.remove('hidden', 'hidden-by-default', 'hidden-until-load');
  typesetElement(element);

  if (get(button) !== null) {
    get(button).innerText = hideText;
  }

  if (!elementsHiddenByDefault.includes(element) && removeFromArray(hiddenElements, element) && save) {
    saveHiddenElements();
  }
  else if (elementsHiddenByDefault.includes(element) && !shownElements.includes(element)) {
    shownElements.push(element);
    if (save) {
      saveShownElements();
    }
  }
}

function hideElement(element, button=null, showText='Show', save=true) {
  if (button === null) {
    button = element + 'Button';
  }
  
  if (get(element) === null) {
    // Element doesn't exist; something went wrong
    return;
  }
  
  get(element).classList.add('hidden');

  if (get(button) !== null) {
    get(button).innerText = showText;
  }

  if (!elementsHiddenByDefault.includes(element) && !hiddenElements.includes(element)) {
    hiddenElements.push(element);
    if (save) {
      saveHiddenElements();
    }
  }
  else if (elementsHiddenByDefault.includes(element) && removeFromArray(shownElements, element) && save) {
    saveShownElements();
  }
}

function showElements(elements, index=0) {
  // This function prevents lag by recursively calling itself, showing the elements one by one
  // If I use a for loop, browsers will try to show all of the elements at the same time, causing a bit of lag
  if (index < elements.length) {
    showElement(elements[index], null, 'Hide', false);
    setTimeout(() => showElements(elements, index + 1));
  }
  else {
    saveShownElements();
    saveHiddenElements();
  }
}

function showHide(element, button=null, save=true) {
  if (element in customTextButtons) {
    var showText = customTextButtons[element]['showText'];
    var hideText = customTextButtons[element]['hideText'];
  }
  else {
    var showText = 'Show';
    var hideText = 'Hide';
  }

  if (isHidden(element)) {
    showElement(element, button, hideText, save);
  }
  else {
    hideElement(element, button, showText, save);
  }
  updateFooter();
}

var typesetUnits = [];
function typesetUnit(unitElement) {
  // Typeset Mathjax for unit
  unitElement = unitElement.replace(/Unit$/, '');
  if (!typesetUnits.includes(unitElement) && 'typeset' in MathJax) {
    var unitHeaders = get(unitElement).getElementsByClassName('section-header');
    for (var header of unitHeaders) {
      MathJax.typeset([header]);
      var sectionID = header.id.replace(/Header$/, '');
      if (!isHidden(sectionID)) {
        typesetElement(sectionID);
      }
    }
    typesetUnits.push(unitElement);
  }
}

function typesetElement(elementID) {
  if (elementsExist('drawingBoard')) {
    return;
  }
  if (!('typeset' in MathJax)) {
    return;
  }
  if (typesetElements.includes(elementID) || unitElementIDs.includes(elementID + 'Unit')) {
    return;
  }
  MathJax.typeset([get(elementID)]);
  typesetElements.push(elementID);
}

function showUnit(unitElement, button=null, hideText='Hide') {
  if (!isHidden(unitElement)) {
    return;
  }

  var nonHiddenElements = [];
  for (var section of getSectionsInUnit(unitElement)){
    if (!isHidden(section)) {
      nonHiddenElements.push(section);
    }
    hideElement(section, null, 'Show', false);
  }
  showElement(unitElement, button, hideText, false);
  showElements(nonHiddenElements);
  typesetUnit(unitElement);
}

function showHideUnit(unitElement, button=null, showText='Show', hideText='Hide') {
  if (isHidden(unitElement)) {
    showUnit(unitElement, button, hideText);
  }
  else {
    hideElement(unitElement, button, showText);
  }
  updateFooter();
}

function toggleAllSections(unit, mode) {
  var sections = getSectionsInUnit(unit);
  if (mode === 'show') {
    showElements(sections);
  }
  else if (mode === 'hide') {
    for (var element of sections) {
      hideElement(element, null, 'Show', false);
    }
    saveShownElements();
  } 
}

function getCurrentUnit() {
  var unitsToCheck = unitElementIDs.slice();
  if (currentUnit !== null) {
    // Check the current unit first; this is faster in most cases since the unit is most likely not going to change when you scroll
    unitsToCheck.unshift(currentUnit);
  }
  for (var elementID of unitsToCheck) {
    var element = get(elementID);
    var rect = element.getBoundingClientRect();
    var viewHeight = window.innerHeight - footer.offsetHeight;
    if (rect.top <= viewHeight && rect.bottom >= viewHeight) {
      return element.id;
    }
  }
}

// Number formatting functions
function round(number, places=0) {
  return math.round(number, places);
}

var largeNumFormat = 'default';
const sciNotDecimals = 4;
const sciNotThresholdHigh = 1e13;
const sciNotThresholdLow = 1e-10

// Returns whether to use scientific notation for a given number
function useScientificNotation(number) {
  if (isComplex(number)) {
    return false;
  }
  var absNumber = Math.abs(number);
  return absNumber >= sciNotThresholdHigh || absNumber < sciNotThresholdLow && absNumber > 0;
}

function formatRealNum(number, places=0, maxSigFigs=null) {
  if (!isFinite(number)) {
    return 'undefined';
  }

  if (maxSigFigs !== null) {
    var digitsInNumber = Math.floor(Math.log10(Math.abs(number))) + 1;
    places = Math.max(0, Math.min(places, maxSigFigs - digitsInNumber));
  }

  var absNumber = Math.abs(number);
  if (absNumber >= 1000) {
    // Add commas to number
    var parts = absNumber.toFixed(places).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var absNumberString = parts.join('.');
  }
  else {
    var absNumberString = absNumber.toFixed(places);
  }

  if (useScientificNotation(number)) {
    // Handle scientific notation
    if (largeNumFormat.endsWith('Engineering')) {
      var exponent = Math.floor(Math.log10(absNumber)) - Math.floor(Math.log10(absNumber)) % 3;
      var mantissa = round(absNumber / 10 ** exponent, sciNotDecimals);
    }
    else {
      var exponent = Math.floor(Math.log10(absNumber));
      var mantissa = round(absNumber / 10 ** exponent, sciNotDecimals);
    }
    if (largeNumFormat === 'e' || largeNumFormat == 'eEngineering') {
      absNumberString = `${mantissa}e${exponent}`;
    }
    else {
      if (exponent >= 0) {
        absNumberString = `${mantissa} × 10^${exponent}`;
      }
      else {
        absNumberString = `${mantissa} × 10^(${exponent})`;
      }
    }
  }
  else if (absNumberString.includes('.')) {
    // Remove trailing zeros from decimals
    absNumberString = absNumberString.replace(/\.*0+$/, '');
  }

  if (number < 0) {
    return '-' + absNumberString;
  }
  return absNumberString;
}

function formatNum(number, places=0, maxSigFigs=null, nonBreakingLength=null, nonBreakingSide='right') {
  number = round(number, places);
  if (isComplex(number)) {
    if (!isFinite(number.re) && !isFinite(number.im)) {
      return 'undefined';
    }
    if (number.re === 0) {
      if (number.im === -1) {
        return '-i';
      }
      else if (number.im === 0) {
        return '0';
      }
      else if (number.im === 1) {
        return 'i';
      }
      else {
        var imagStr = formatNum(number.im, places);
        if (useScientificNotation(number.im)) {
          imagStr = `(${imagStr})`;
        }
        return imagStr + 'i';
      }
    }
    var realStr = formatRealNum(number.re, places, maxSigFigs);
    // imagStr is the absolute value of the imaginary part formatted to a string
    var imagStr = formatRealNum(Math.abs(number.im), places, maxSigFigs);
    if (useScientificNotation(number.im)) {
      imagStr = `(${imagStr})`;
    }
    if (Math.abs(number.im) === 1) {
      imagStr = '';
    }

    if (number.im === 0) {
      var string = realStr;
    }
    else if (number.im > 0) {
      var string = `${realStr} + ${imagStr}i`;
    }
    else {
      var string = `${realStr} - ${imagStr}i`;
    }
  }
  else {
    var string = formatRealNum(number, places, maxSigFigs);
  }

  if (nonBreakingLength !== null) {
    // Add non-breaking spaces until number reaches length
    // Used to make tables not as shaky when values change
    if (nonBreakingSide === 'left') {
      string = '\xa0'.repeat(Math.max(nonBreakingLength - string.length, 0)) + string;
    }
    else {
      string += '\xa0'.repeat(Math.max(nonBreakingLength - string.length, 0));
    }
  }
  return string;
}

// Riemann sum functions
function riemannSumLoop(func, x, width, runs) {
  var totalHeight = 0;
  for (var i = 0; i < runs; i++) {
    totalHeight += func(x);
    x += width;
  }
  return totalHeight;
}

// For Riemann sums with displayProgress enabled
function riemannOutput(id, rectangles, area) {
  get(id + 'Val1').innerText = formatNum(rectangles);
  get(id + 'Val2').innerText = formatNum(area, 7);
}

var riemannTimeout = null;
function riemannSum(func, interval, rectangles, sumType, displayProgress=false, chunkSize=1e6, id=null) {
  var progressID = id + 'Progress';
  clearTimeout(riemannTimeout);
  if (displayProgress && rectangles < chunkSize * 2) {
    get(progressID).innerText = '';
  }

  var start = interval[0];
  var end = interval[1];
  var totalHeight = 0;
  var width = (end - start) / rectangles;

  if (sumType === 'right') {
    var x = start + width;
  }
  else if (sumType === 'left') {
    var x = start;
  }
  else if (sumType === 'midpoint') {
    var x = start + width / 2;
  }
  else if (sumType === 'trapezoid') {
    var x = start;
    var a = null;
    var b = func(x);
    for (var i = 0; i < rectangles; i++) {
      a = b;
      x += width;
      b = func(x);
      totalHeight += (a + b) / 2;
    }
    return totalHeight * width;
  }
  
  if (displayProgress) {
    if (rectangles > chunkSize * 2) {
      // Calculate chunkSize rectangles at once instead of all at once
      // This is for the progress display to work
      var progressElement = get(progressID);
      function calculateChunk(i=0) {
        progressElement.innerText = `Calculating area... (${formatNum(i * chunkSize)} / ${formatNum(rectangles)})`;
        if (i >= Math.floor(rectangles / chunkSize)) {
          totalHeight += riemannSumLoop(func, x, width, rectangles % chunkSize);
          progressElement.innerText = '';
          riemannOutput(id, rectangles, totalHeight * width);
          return;
        }
        totalHeight += riemannSumLoop(func, x, width, chunkSize);
        x += chunkSize * width;
        riemannTimeout = setTimeout(() => calculateChunk(i + 1));
      }
      calculateChunk();
    }
    else {
      riemannOutput(id, rectangles, riemannSumLoop(func, x, width, rectangles) * width);
    }
  }
  else {
    return riemannSumLoop(func, x, width, rectangles) * width;
  }
}

// Sequence and series functions
const termsToDisplay = 5; // How many terms are displayed at one time for each sequence
function displaySequence(element) {
  if (!elementsExist(element + 'Seq')) {
    return;
  }
  var terms = [];
  var rule = sequenceSettings[element]['rule'];
  var start = sequenceStates[element];
  for (var i = start; i < start + termsToDisplay; i++) {
    terms.push(formatNum(rule(i), sequenceSettings[element]['places']));
  }
  if (start === 1) {
    var termStr = terms.join(', ') + '...';
  }
  else {
    var termStr = '...' + terms.join(', ') + '...';
  }
  get(element + 'Seq').innerText = termStr;
}

function prevTerm(element) {
  var index = sequenceStates[element];
  if (index === 1) {
    return;
  }
  sequenceStates[element]--;
  displaySequence(element);
}

function nextTerm(element) {
  sequenceStates[element]++;
  displaySequence(element);
}

function formatSeriesTerm(term, places, maxSigFigs, displayAsFraction, returnRegularTerm, termDisplayRule, n) {
  if (termDisplayRule !== null) {
    var numStr = termDisplayRule(n);
    if (returnRegularTerm) {
      // remove leading +
      return numStr.replace(/^\+/, '');
    }
    else {
      // add spaces to leading + or -
      return numStr.replace(/^\+/, ' + ').replace(/^\-/, ' - ');
    }
  }
  else if (displayAsFraction) {
    if (useScientificNotation(1 / Math.abs(term))) {
      var numStr = `1/(${formatNum(1 / Math.abs(term), 3)})`;
    }
    else {
      var numStr = `1/${formatNum(1 / Math.abs(term), 3)}`;
    }
  }
  else {
    var numStr = formatNum(Math.abs(term), places, maxSigFigs);
  }
  if (returnRegularTerm) {
    return term >= 0 ? numStr : '-' + numStr;
  }
  if (term >= 0) {
    return ` + ${numStr}`;
  }
  return ` - ${numStr.replace('-', '')}`;
}

function displayPartialSum(id, func, partialSumFunc, terms, places=0, displayAsFraction=false, endingTerms=1, termDisplayRule=null, maxSigFigs=null) {
  // endingTerms: Terms to display at the end of the sum
  // termDisplayRule: Custom rule for displaying each term (e.g. factorials in denominators)
  // Max terms to display in full (any more will cause some terms to be omitted)
  const maxTerms = 6;
  var sumText = formatSeriesTerm(func(1), places, maxSigFigs, displayAsFraction, true, termDisplayRule, 1); // first term of series
  // First (maxTerms - endingTerms - 1) terms
  for (var n = 2; n <= Math.min(terms, maxTerms - endingTerms - 1); n++) {
    sumText += formatSeriesTerm(func(n), places, maxSigFigs, displayAsFraction, false, termDisplayRule, n);
  }
  if (terms <= maxTerms) {
    for (var n = maxTerms - endingTerms; n <= terms; n++) {
      sumText += formatSeriesTerm(func(n), places, maxSigFigs, displayAsFraction, false, termDisplayRule, n);
    }
  }
  else {
    if (func(maxTerms - endingTerms) >= 0) {
      sumText += ' + ... ';
    }
    else {
      sumText += ' - ... ';
    }
    for (var n = terms - endingTerms + 1; n <= terms; n++) {
      sumText += formatSeriesTerm(func(n), places, maxSigFigs, displayAsFraction, false, termDisplayRule, n);
    }
  }

  var partialSum = partialSumFunc(terms);
  if (useScientificNotation(partialSum)) {
    var exponent = Math.floor(Math.log10(Math.abs(partialSum)));
    var mantissa = round(Math.abs(partialSum) / 10 ** exponent, sciNotDecimals);
    var displayedValue = mantissa * 10 ** exponent;
  }
  else {
    var displayedValue = round(partialSum, places);
  }
  if (math.equal(round(partialSum, 14), displayedValue)) {
    sumText += ' = ';
  }
  else {
    sumText += ' ≈ ';
  }
  sumText += formatNum(partialSum, places, maxSigFigs);
  get(id + 'Sum').innerText = sumText;
}

// Canvas graph functions
function xyToCoords(x, y, xBounds, yBounds, width, height) {
  return [(x - xBounds[0]) / (xBounds[1] - xBounds[0]) * width, (1 - (y - yBounds[0]) / (yBounds[1] - yBounds[0])) * height];
}

function updateCanvasSize(canvas) {
  var width = canvas.offsetWidth;
  var height = canvas.offsetHeight;
  if (width === 0) {
    // min(90vw, 400px)
    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
    width = Math.round(Math.min(viewportWidth * 0.9, 400));
    if (canvas.classList.contains('canvas-graph')) {
      height = width;
    }
    else if (canvas.classList.contains('short-canvas-graph')) {
      height = width / 4;
    }
  }

  if (canvas.width !== width && width !== 0) {
    canvas.width = width;
  }
  if (canvas.height !== height && height !== 0) {
    canvas.height = height;
  }
}

function drawAxes(config, width, height, noYAxis=false, labelXAxis=false, labelYAxis=false, xAxisLabels=null, yAxisLabels=null) {
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  ctx.lineWidth = 2;
  ctx.strokeStyle = darkModeEnabled ? '#f3f3f3' : 'black';
  if (xBounds[0] < 0 && xBounds[1] > 0 && !noYAxis) {
    var yAxisCoord = xyToCoords(0, 0, xBounds, yBounds, width, height)[0];
    ctx.beginPath();
    ctx.moveTo(yAxisCoord, 0);
    ctx.lineTo(yAxisCoord, height);
    ctx.stroke();
  }
  
  if (yBounds[0] < 0 && yBounds[1] > 0) {
    var xAxisCoord = xyToCoords(0, 0, xBounds, yBounds, width, height)[1];
    var yAxisCoord = xyToCoords(0, 0, xBounds, yBounds, width, height)[0];
    ctx.beginPath();
    ctx.moveTo(0, xAxisCoord);
    ctx.lineTo(width, xAxisCoord);
    ctx.stroke();
    if (labelXAxis) {
      if (xAxisLabels === null) {
        var xAxisLabelLeft = formatNum(xBounds[0], 1);
        var xAxisLabelRight = formatNum(xBounds[1], 1);
      }
      else {
        var xAxisLabelLeft = xAxisLabels[0];
        var xAxisLabelRight = xAxisLabels[1];
      }
      ctx.font = "25px Arial";
      ctx.fillStyle = darkModeEnabled ? '#f3f3f3' : 'black';
      ctx.textAlign = 'left';
      ctx.fillText(xAxisLabelLeft, 0, xAxisCoord - 10);
      ctx.textAlign = 'right';
      ctx.fillText(xAxisLabelRight, width, xAxisCoord - 10);
    }
    if (labelYAxis) {
      if (yAxisLabels === null) {
        var yAxisLabelBottom = formatNum(yBounds[0], 1);
        var yAxisLabelTop = formatNum(yBounds[1], 1);
      }
      else {
        var yAxisLabelBottom = yAxisLabels[0];
        var yAxisLabelTop = yAxisLabels[1];
      }
      ctx.font = "25px Arial";
      ctx.fillStyle = darkModeEnabled ? '#f3f3f3' : 'black';
      ctx.textAlign = 'left';
      ctx.fillText(yAxisLabelBottom, yAxisCoord + 10, height - 5);
      ctx.fillText(yAxisLabelTop, yAxisCoord + 10, 20);
    }
  }
}

function initializeGraph(config, noYAxis=false, labelXAxis=false) {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  updateCanvasSize(canvas);
  var width = canvas.width;
  var height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  drawAxes(config, width, height, noYAxis, labelXAxis);
}

function canvasGraph(config, func, color='red', clear=true, asymptotes=null, asymptotePeriod=null, widthMultiplier=1) {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  updateCanvasSize(canvas);

  var width = canvas.width;
  var height = canvas.height;


  if (clear) {
    ctx.clearRect(0, 0, width, height);
    drawAxes(config, width, height);
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = color;

  var coords = xyToCoords(xBounds[0], func(xBounds[0]), xBounds, yBounds, width, height);  
  var startXPos = coords[0];
  var startYPos = coords[1];

  // Canvas breaks with large numbers so let's limit startYPos to between -height and 2 * height
  if (startYPos > 2 * height) {
    startYPos = 2 * height;
  }
  else if (startYPos < -height) {
    startYPos = -height;
  }

  ctx.beginPath();
  ctx.moveTo(startXPos, startYPos);

  var lastXPos = startXPos;
  var pixelWidth = (xBounds[1] - xBounds[0]) / (width * widthMultiplier);
  
  for (var pixel = 1; pixel <= width * widthMultiplier; pixel++) {
    var x = (pixel / (width * widthMultiplier)) * (xBounds[1] - xBounds[0]) + xBounds[0];
    var y = func(x);
    var coords = xyToCoords(x, y, xBounds, yBounds, width, height);
    var nextXPos = coords[0];
    var nextYPos = coords[1];
    if (nextYPos > 2 * height) {
      nextYPos = 2 * height;
    }
    else if (nextYPos < -height) {
      nextYPos = -height;
    }
    if (isFinite(y)) {
      var isAsymptote = false;
      if (asymptotes !== null) {
        for (var asymptote of asymptotes) {
          if (asymptotePeriod != null) {
            if (mod(x, asymptotePeriod) >= mod(asymptote, asymptotePeriod) && mod(x, asymptotePeriod) <= mod((asymptote + pixelWidth), asymptotePeriod)) {
              isAsymptote = true;
            }  
          }
          else {
            if (x >= asymptote && x <= (asymptote + pixelWidth)) {
              isAsymptote = true;
            }  
          }
        }
      }
      if (lastXPos !== null && !isAsymptote) {
        ctx.lineTo(nextXPos, nextYPos);
      }
      else {
        ctx.moveTo(nextXPos, nextYPos);
      }
      lastXPos = nextXPos;
    }
    else {
      lastXPos = null;
    }
  }
  ctx.stroke();
}

function shadeGraph(config, func, leftX, rightX, color='pink', asymptotes=null) {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  var width = canvas.width;
  var height = canvas.height;

  ctx.lineWidth = 2;
  ctx.fillStyle = color;

  if (leftX > rightX) {
    var temp = rightX;
    rightX = leftX;
    leftX = temp;
  }

  if (leftX < xBounds[0]) {
    leftX = xBounds[0];
  }
  if (rightX > xBounds[1]) {
    rightX = xBounds[1];
  }

  if (!isFinite(func(leftX)) || !isFinite(func(rightX))) {
    return;
  }
  if (asymptotes !== null) {
    for (var asymptote of asymptotes) {
      if (leftX <= asymptote && rightX >= asymptote) {
        return;
      }
    }
  }

  // point (leftX, 0)
  var leftCoords = xyToCoords(leftX, 0, xBounds, yBounds, width, height);
  // point (rightX, 0)
  var rightCoords = xyToCoords(rightX, 0, xBounds, yBounds, width, height);
  
  ctx.beginPath();
  ctx.moveTo(leftCoords[0], leftCoords[1]);
  var pixelsToDraw = Math.round(rightCoords[0] - leftCoords[0]);

  var coords = xyToCoords(leftX, func(leftX), xBounds, yBounds, width, height);
  var lastXPos = coords[0];
  var lastYPos = coords[1];
  ctx.lineTo(lastXPos, lastYPos);

  for (var pixel = 1; pixel <= pixelsToDraw; pixel++) {
    var x = (pixel / pixelsToDraw) * (rightX - leftX) + leftX;
    var y = func(x);
    var coords = xyToCoords(x, y, xBounds, yBounds, width, height);
    var nextXPos = coords[0];
    var nextYPos = coords[1];
    if (isFinite(y)) {
      if (lastXPos !== null) {
        ctx.lineTo(nextXPos, nextYPos);
      }
      lastXPos = nextXPos;
      lastYPos = nextYPos;
    }
    else {
      lastXPos = null;
      lastYPos = null;
    }
  }
  
  ctx.lineTo(rightCoords[0], rightCoords[1]);
  ctx.lineTo(leftCoords[0], leftCoords[1]);
  ctx.closePath();
  ctx.fill();
}

function plotVerticalLine(config, x, color='red') {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  updateCanvasSize(canvas);

  var width = canvas.width;
  var height = canvas.height;

  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  var lineX = xyToCoords(x, 0, xBounds, yBounds, width, height)[0];
  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, height);
  ctx.stroke();
}

function plotCircle(config, radius, color='red') {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  updateCanvasSize(canvas);

  var width = canvas.width;
  var height = canvas.height;

  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  var circleCoords = xyToCoords(0, 0, xBounds, yBounds, width, height);
  var circleRadius = radius / (xBounds[1] - xBounds[0]) * width;
  ctx.beginPath();
  ctx.arc(circleCoords[0], circleCoords[1], circleRadius, 0, 2 * Math.PI);
  ctx.stroke();
}

function plotUnitHyperbola(config, color='red') {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  updateCanvasSize(canvas);

  var width = canvas.width;
  var height = canvas.height;

  ctx.lineWidth = 2;
  ctx.strokeStyle = color;

  // Right side of hyperbola
  var coords = xyToCoords(Math.sqrt(1 + yBounds[0] ** 2), yBounds[0], xBounds, yBounds, width, height);
  ctx.beginPath();
  ctx.moveTo(coords[0], coords[1])
  for (var pixel = 1; pixel <= height; pixel++) {
    var y = (pixel / height) * (yBounds[1] - yBounds[0]) + yBounds[0];
    var x = Math.sqrt(1 + y ** 2);
    var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
    ctx.lineTo(nextCoords[0], nextCoords[1]);
  }
  ctx.stroke();

  // Left side of hyperbola
  var coords = xyToCoords(-Math.sqrt(1 + yBounds[0] ** 2), yBounds[0], xBounds, yBounds, width, height);
  ctx.beginPath();
  ctx.moveTo(coords[0], coords[1])
  for (var pixel = 1; pixel <= height; pixel++) {
    var y = (pixel / height) * (yBounds[1] - yBounds[0]) + yBounds[0];
    var x = -Math.sqrt(1 + y ** 2);
    var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
    ctx.lineTo(nextCoords[0], nextCoords[1]);
  }
  ctx.stroke();
}

function shadeUnitCircle(config, input, color='pink') {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  updateCanvasSize(canvas);

  var width = canvas.width;
  var height = canvas.height;

  ctx.lineWidth = 2;
  ctx.fillStyle = color;
  
  ctx.beginPath();
  var coords = xyToCoords(1, 0, xBounds, yBounds, width, height);
  ctx.moveTo(coords[0], coords[1]);
  var xEquals1Coord = coords[0];
  var cosCoord = xyToCoords(Math.cos(input), 0, xBounds, yBounds, width, height)[0];
  var xEqualsNeg1Coord = xyToCoords(-1, 0, xBounds, yBounds, width, height)[0];
  // Trace circle
  if (input > Math.PI) {
    for (var pixel = xEquals1Coord; pixel >= xEqualsNeg1Coord; pixel--) {
      var x = (pixel / width) * (xBounds[1] - xBounds[0]) + xBounds[0];
      var y = Math.sqrt(1 - x ** 2);
      var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
      ctx.lineTo(nextCoords[0], nextCoords[1]);
    }
    for (var pixel = xEqualsNeg1Coord; pixel <= cosCoord; pixel++) {
      var x = (pixel / width) * (xBounds[1] - xBounds[0]) + xBounds[0];
      var y = -Math.sqrt(1 - x ** 2);
      var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
      ctx.lineTo(nextCoords[0], nextCoords[1]);
    }
  }
  else {
    for (var pixel = xEquals1Coord; pixel >= cosCoord; pixel--) {
      var x = (pixel / width) * (xBounds[1] - xBounds[0]) + xBounds[0];
      var y = Math.sqrt(1 - x ** 2);
      var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
      ctx.lineTo(nextCoords[0], nextCoords[1]);
    }
  }
  coords = xyToCoords(Math.cos(input), Math.sin(input), xBounds, yBounds, width, height);
  ctx.lineTo(coords[0], coords[1]);
  // Move to origin
  coords = xyToCoords(0, 0, xBounds, yBounds, width, height);
  ctx.lineTo(coords[0], coords[1]);
  // Move to (1, 0)
  coords = xyToCoords(1, 0, xBounds, yBounds, width, height);
  ctx.lineTo(coords[0], coords[1]);
  ctx.fill();
}

function shadeUnitHyperbola(config, input, color='pink') {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];

  updateCanvasSize(canvas);

  var width = canvas.width;
  var height = canvas.height;

  ctx.lineWidth = 2;
  ctx.fillStyle = color;
  
  ctx.beginPath();
  var coords = xyToCoords(1, 0, xBounds, yBounds, width, height);
  ctx.moveTo(coords[0], coords[1]);
  var yAxisCoord = coords[1];
  // Move from (1, 0) to origin
  coords = xyToCoords(0, 0, xBounds, yBounds, width, height);
  ctx.lineTo(coords[0], coords[1]);
  // Move to (cosh(x), sinh(x))
  coords = xyToCoords(Math.cosh(input), Math.sinh(input), xBounds, yBounds, width, height);
  ctx.lineTo(coords[0], coords[1]);
  // Trace hyperbola
  if (input > 0) {
    for (var pixel = coords[1]; pixel <= yAxisCoord; pixel++) {
      var y = (1 - pixel / height) * (yBounds[1] - yBounds[0]) + yBounds[0];
      var x = Math.sqrt(1 + y ** 2);
      var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
      ctx.lineTo(nextCoords[0], nextCoords[1]);
    }
  }
  else {
    for (var pixel = coords[1]; pixel >= yAxisCoord; pixel--) {
      var y = (1 - pixel / height) * (yBounds[1] - yBounds[0]) + yBounds[0];
      var x = Math.sqrt(1 + y ** 2);
      var nextCoords = xyToCoords(x, y, xBounds, yBounds, width, height);
      ctx.lineTo(nextCoords[0], nextCoords[1]);
    }
  }
  ctx.fill();
}

function plotPoint(config, x, y, color='blue', empty=false) {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];
  ctx.fillStyle = color;
  var coords = xyToCoords(x, y, xBounds, yBounds, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(coords[0], coords[1], 5, 0, 2 * Math.PI);
  if (empty) {
    ctx.fillStyle = darkModeEnabled ? '#222222' : '#f3f3f3';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.arc(coords[0], coords[1], 5, 0, 2 * Math.PI);
    ctx.stroke();
  }
  else {
    ctx.fill();
  }
}

function plotTangentLine(config, func, derivative, pointX, color='green') {
  var slope = derivative(pointX);
  var pointY = func(pointX);
  if (Math.abs(slope) === Infinity && isFinite(pointY)) {
    // Vertical tangent line
    plotVerticalLine(config, pointX, color);
  }
  canvasGraph(config, x => slope * (x - pointX) + pointY, color, false);
}

function plotSecantLine(config, func, point1X, point2X, color='purple') {
  var slope = (func(point2X) - func(point1X)) / (point2X - point1X);
  canvasGraph(config, x => slope * (x - point1X) + func(point1X), color, false);
}

function drawRectangle(config, x1, x2, y1, y2, strokeColor='blue', fillColor='lightblue') {
  // x1 = left edge
  // x2 = right edge
  // y1 = bottom edge
  // y2 = top edge
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];
  var width = canvas.width;
  var height = canvas.height;

  var leftBottomCoords = xyToCoords(x1, y1, xBounds, yBounds, width, height);
  var leftCoord = leftBottomCoords[0];
  var bottomCoord = leftBottomCoords[1];
  var rightTopCoords = xyToCoords(x2, y2, xBounds, yBounds, width, height);
  var rightCoord = rightTopCoords[0];
  var topCoord = rightTopCoords[1];

  ctx.lineWidth = 2;
  ctx.strokeStyle = strokeColor;
  ctx.strokeRect(leftCoord, topCoord, rightCoord - leftCoord, bottomCoord - topCoord);
  ctx.fillStyle = fillColor;
  ctx.fillRect(leftCoord, topCoord, rightCoord - leftCoord, bottomCoord - topCoord);
}

function drawTrapezoid(config, x1, x2, leftHeight, rightHeight, strokeColor='blue', fillColor='lightblue') {
  var canvas = config['canvas'];
  var ctx = config['ctx'];
  var xBounds = config['xBounds'];
  var yBounds = config['yBounds'];
  var width = canvas.width;
  var height = canvas.height;

  var leftBottomCoords = xyToCoords(x1, 0, xBounds, yBounds, width, height);
  var leftCoord = leftBottomCoords[0];
  var bottomCoord = leftBottomCoords[1];
  var leftHeightCoord = xyToCoords(x1, leftHeight, xBounds, yBounds, width, height)[1];
  var rightHeightCoords = xyToCoords(x2, rightHeight, xBounds, yBounds, width, height);
  var rightCoord = rightHeightCoords[0];
  var rightHeightCoord = rightHeightCoords[1];


  ctx.lineWidth = 2;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(leftCoord, bottomCoord);
  ctx.lineTo(leftCoord, leftHeightCoord);
  ctx.lineTo(rightCoord, rightHeightCoord);
  ctx.lineTo(rightCoord, bottomCoord);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

// Slider functions
function increaseSliderMax(sliderID, buttonID, oldMax, newMax, geometric=true) {
  get(buttonID).classList.add('hidden');
  // will only work if slider minimum is 1
  if (geometric) {
    get(sliderID).max = Math.log(newMax) / Math.log(oldMax);
  }
  else {
    get(sliderID).max = (newMax - 1) / (oldMax - 1);
  }
}

function setSliderValue(id, value) {
  var settings = sliderSettings[id];
  var sliderRange = settings['sliderRange'];
  var sliderMin = sliderRange[0];
  var sliderMax = sliderRange[1];
  if (settings['geometric']) {
    var sliderPos = (Math.log(value) - Math.log(sliderMin)) / (Math.log(sliderMax) - Math.log(sliderMin));
  }
  else {
    var sliderPos = (value - sliderMin) / (sliderMax - sliderMin);
  }
  get(id + 'Slider').value = sliderPos;
  updateSliderValues(id);
}

function getSliderValue(id) {
  var min = sliderSettings[id]['sliderRange'][0];
  var max = sliderSettings[id]['sliderRange'][1];
  var value = parseFloat(get(id + 'Slider').value);
  if ('geometric' in sliderSettings[id] && sliderSettings[id]['geometric']) {
    return Math.exp((Math.log(max) - Math.log(min)) * value) * min;
  }
  return value * (max - min) + min;
}

// Sliders with infinite series visuals
const seriesVisuals = ['infSeriesIntro3', 'infSeriesIntro4', 'infSeriesOscillate', 'geoSeries', 'geoSeries2', 'geoSeriesInteractive', 'nthTermHarmonic', 'comparisonTest', 'integralTest1', 'integralTest2', 'altSeries1', 'altSeries2', 'altSeries3', 'altSeries4', 'altSeries5', 'altSeriesDivergent1', 'altSeriesDivergent2', 'altSeriesDivergent3'];

// Functions for interactive sections
const interactiveFuncs = {
  'x': {
    'func': x => x,
    'derivative': x => 1,
    'derivativeHTML': "1",
    'antiderivative': x => x ** 2 / 2,
  },
  'negative': {
    'func': x => -x,
    'derivative': x => -1,
    'derivativeHTML': "-1",
    'antiderivative': x => -(x ** 2 / 2),
  },
  'square': {
    'func': x => x ** 2,
    'derivative': x => 2 * x,
    'derivativeHTML': "2x",
    'antiderivative': x => x ** 3 / 3,
  },
  'cube': {
    'func': x => x ** 3,
    'derivative': x => 3 * x ** 2,
    'derivativeHTML': "3x<sup>2</sup>",
    'antiderivative': x => x ** 4 / 4,
  },
  'sqrt': {
    'func': x => Math.sqrt(x),
    'derivative': x => 1 / (2 * Math.sqrt(x)),
    'derivativeHTML': "1/(2√x)",
    'antiderivative': x => (2/3) * x ** (3/2),
  },
  'cbrt': {
    'func': x => Math.cbrt(x),
    'derivative': x => (1/3) / (Math.cbrt(x) ** 2),
    'derivativeHTML': "(1/3)x<sup>-2/3</sup>",
    'antiderivative': x => (3/4) * (Math.cbrt(x)) ** 4,
  },
  'sin': {
    'func': x => Math.sin(x),
    'derivative': x => Math.cos(x),
    'derivativeHTML': "cos(x)",
    'antiderivative': x => 1 - Math.cos(x),
  },
  'cos': {
    'func': x => Math.cos(x),
    'derivative': x => -Math.sin(x),
    'derivativeHTML': "-sin(x)",
    'antiderivative': x => Math.sin(x),
  },
  'tan': {
    'func': x => Math.tan(x),
    'derivative': x => 1 / Math.cos(x) ** 2,
    'derivativeHTML': "sec<sup>2</sup>(x)",
    'antiderivative': x => Math.log(Math.abs(sec(x))),
    'asymptotes': [Math.PI / 2],
    'asymptotePeriod': Math.PI,
  },
  'exp': {
    'func': x => Math.exp(x),
    'derivative': x => Math.exp(x),
    'derivativeHTML': "e<sup>x</sup>",
    'antiderivative': x => Math.exp(x) - 1,
  },
  'ln': {
    'func': x => Math.log(x),
    'derivative': x => x > 0 ? 1 / x : NaN,
    'derivativeHTML': "1/x",
    'antiderivative': x => x * Math.log(x) - x,
  },
  'lnPlus1': {
    'func': x => Math.log(x + 1),
    'derivative': x => x > 1 ? 1 / x : NaN,
    'derivativeHTML': "1/x",
    'antiderivative': x => (x + 1) * Math.log(x + 1) - (x + 1) + 1,
  },
  'reciprocal': {
    'func': x => 1 / x,
    'derivative': x => -1 / x ** 2,
    'derivativeHTML': "-1/x<sup>2</sup>",
    'asymptotes': [0],
  },
  'reciprocalPlus1': {
    'func': x => 1 / (x + 1),
    'antiderivative': x => Math.log(x + 1),
    'asymptotes': [-1],
  },
  'cot': {
    'func': x => 1 / Math.tan(x),
    'derivative': x => -1 / Math.sin(x) ** 2,
    'derivativeHTML': "-csc<sup>2</sup>(x)",
    'antiderivative': x => Math.log(Math.abs(Math.sin(x))),
    'asymptotes': [0],
    'asymptotePeriod': Math.PI
  },
  'csc': {
    'func': x => 1 / Math.sin(x),
    'derivative': x => -cot(x) * csc(x),
    'derivativeHTML': "-cot(x)csc(x)",
    'antiderivative': x => -Math.log(Math.abs(csc(x) + cot(x))),
    'asymptotes': [0],
    'asymptotePeriod': Math.PI
  },
  'sec': {
    'func': x => 1 / Math.cos(x),
    'derivative': x => Math.tan(x) * sec(x),
    'derivativeHTML': "tan(x)sec(x)",
    'antiderivative': x => -Math.log(Math.abs(sec(x) + Math.tan(x))),
    'asymptotes': [Math.PI / 2],
    'asymptotePeriod': Math.PI
  },
  'expBase2': {
    'func': x => 2 ** x,
    'derivative': x => 2 ** x * Math.log(2),
    'derivativeHTML': "2<sup>x</sup> ln(2)"
  },
  'expBase10': {
    'func': x => 10 ** x,
    'derivative': x => 10 ** x * Math.log(10),
    'derivativeHTML': "10<sup>x</sup> ln(10)"
  },
  'logBase2': {
    'func': x => Math.log2(x),
    'derivative': x => x > 0 ? 1 / (x * Math.log(2)) : NaN,
    'derivativeHTML': "1/(x ln(2))"
  },
  'logBase10': {
    'func': x => Math.log10(x),
    'derivative': x => x > 0 ? 1 / (x * Math.log(10)) : NaN,
    'derivativeHTML': "1/(x ln(10))"
  },
  'arcsin': {
    'func': x => Math.asin(x),
    'derivative': x => 1 / Math.sqrt(1 - x ** 2),
    'derivativeHTML': "1/√(1-x<sup>2</sup>)"
  },
  'arccos': {
    'func': x => Math.acos(x),
    'derivative': x => -1 / Math.sqrt(1 - x ** 2),
    'derivativeHTML': "-1/√(1-x<sup>2</sup>)"
  },
  'arctan': {
    'func': x => Math.atan(x),
    'derivative': x => 1 / (1 + x ** 2),
    'derivativeHTML': "1/(1+x<sup>2</sup>)"
  },
  'arccsc': {
    'func': x => Math.asin(1 / x),
    'derivative': x => -1 / (Math.abs(x) * Math.sqrt(x ** 2 - 1)),
    'derivativeHTML': "-1/(|x|√(x<sup>2</sup>-1))"
  },
  'arcsec': {
    'func': x => Math.acos(1 / x),
    'derivative': x => 1 / (Math.abs(x) * Math.sqrt(x ** 2 - 1)),
    'derivativeHTML': "1/(|x|√(x<sup>2</sup>-1))"
  },
  'arccot': {
    'func': x => x === 0 ? Math.PI / 2 : x > 0 ? Math.atan(1 / x) : Math.PI + Math.atan(1 / x),
    'derivative': x => -1 / (1 + x ** 2),
    'derivativeHTML': "-1/(1+x<sup>2</sup>)",
  },
  'expBaseX': {
    'func': x => x ** x,
    'derivative': x => x ** x * (Math.log(x) + 1),
    'derivativeHTML': "x<sup>x</sup>(ln(x) + 1)"
  }
};

function updateSliderValues(id, inputX=false, forceUpdate=false) {
  var sliderID = id + 'Slider';
  var outputID = id + 'Val';
  var slider = get(sliderID);
  if (slider === null) {
    return;
  }

  var value = parseFloat(slider.value);

  // Save slider value to prevSliderValues
  var prevSliderValue = prevSliderValues[id];
  // If the slider value hasn't changed, don't bother updating everything else
  if (value === prevSliderValue && !forceUpdate && !inputX) {
    return;
  }

  prevSliderValues[id] = value;

  // Default values
  var geometric = false;
  var inputPlaces = 3;
  var outputPlaces = 3;
  var instantUpdate = true;
  var endingTerms = 1;
  var forceUpdate = null;
  var maxSigFigs = null;

  var partialSum = id in sequenceSettings;
  // Partial sum of infinite series: set func to partial sum function
  if (partialSum) {
    var settings = sequenceSettings[id];
    var ruleFunc = settings['rule'];
    if ('partialSum' in settings) {
      var func = settings['partialSum'];
    }
    else {
      var func = slowPartialSum(ruleFunc);
    }
    if ('termDisplayRule' in settings) {
      var termDisplayRule = settings['termDisplayRule'];
    }
    else {
      var termDisplayRule = null;
    }
    if ('geometric' in settings) {
      geometric = settings['geometric'];
    }
    var displayAsFraction = false;
    if ('displayAsFraction' in settings) {
      displayAsFraction = settings['displayAsFraction'];
    }
    inputPlaces = 0;
    outputPlaces = settings['places'];
    if ('endingTerms' in settings) {
      endingTerms = settings['endingTerms'];
    }
    if ('maxSigFigs' in settings) {
      maxSigFigs = settings['maxSigFigs'];
    }
  }
  else if (id in sliderSettings) {
    var settings = sliderSettings[id];
    var func = settings['func'];
    if ('geometric' in settings) {
      geometric = settings['geometric'];
    }
    if ('inputPlaces' in settings) {
      inputPlaces = settings['inputPlaces'];
    }
    if ('outputPlaces' in settings) {
      outputPlaces = settings['outputPlaces'];
    }
    if ('instantUpdate' in settings) {
      instantUpdate = settings['instantUpdate'];
    }
    if ('forceUpdate' in settings) {
      forceUpdate = settings['forceUpdate'];
    }
    if ('maxSigFigs' in settings) {
      maxSigFigs = settings['maxSigFigs'];
    }
  }

  var sliderRange = settings['sliderRange'];
  var sliderMin = sliderRange[0];
  var sliderMax = sliderRange[1];

  if (inputX) {
    var x = round(parseFloat(get(id + 'Input').value), inputPlaces);
    if (!isFinite(x)) {
      return;
    }
  }
  else {
    // Calculate value of x based on slider position
    if (geometric) {
      var x = round(Math.exp((Math.log(sliderMax) - Math.log(sliderMin)) * value) * sliderMin, inputPlaces);
    }
    else {
      var x = round((sliderMax - sliderMin) * value + sliderMin, inputPlaces);
    }
  }
  
  // Display partial sum if necessary
  if (partialSum) {
    displayPartialSum(id, settings['rule'], func, x, outputPlaces, displayAsFraction, endingTerms, termDisplayRule, maxSigFigs);
    if ('ruleB' in settings) {
      displayPartialSum(id + 'B', settings['ruleB'], settings['partialSumB'], x, outputPlaces, displayAsFraction, endingTerms, termDisplayRule);
    }
  }

  // Update x-value
  if (elementsExist(outputID + '1') && instantUpdate) {
    get(outputID + '1').innerText = formatNum(x, inputPlaces);
  }

  // Update f(x) value
  var f_x = func(x);
  if (f_x !== undefined) {
    f_x = round(f_x, outputPlaces);
    if (elementsExist(outputID + '2') && instantUpdate) {
      get(outputID + '2').innerText = formatNum(f_x, outputPlaces, maxSigFigs);
    }
  }

  if (forceUpdate !== null) {
    updateSliderValues(forceUpdate, false, true);
  }

  // Initialize graph and derivative functions
  if (id in graphSettings) {
    var config = graphSettings[id];
    var graphFunc = config['func'];
    var derivative = config['derivative'];
  }

  if (['limitsIntro1', 'limitsIntro2', 'limitsIntro3', 'limitsIntro4', 'gammaFunc2'].includes(id)) {
    if (id === 'gammaFunc2') {
      canvasGraph(config, graphFunc, 'red', true, [-4, -3, -2, -1, 0], null, 2);
    }
    else {
      canvasGraph(config, graphFunc);
    }
    if (['limitsIntro3', 'limitsIntro4'].includes(id)) {
      plotPoint(config, 0, 0, 'red', true);
    }
    plotPoint(config, x, graphFunc(x));
  }
  // Canvas graphs with tangent lines
  else if (['diffExample2', 'diffDemo', 'diffSin', 'diffCos', 'diffExp', 'diffLn', 'critPoints', 'diffIntervals', 'diffIntervals2', 'concavity'].includes(id)) {
    canvasGraph(config, graphFunc);
    plotTangentLine(config, graphFunc, derivative, x);
    plotPoint(config, x, graphFunc(x));
    setText(id + 'FuncVal', formatNum(graphFunc(x), outputPlaces));
  }
  // Riemann sum graphs
  else if (['riemannLeft', 'riemannRight', 'riemannMidpoint'].includes(id)) {
    initializeGraph(config);
    var rectanglesToDraw = Math.min(400, x);
    var width = 2 / rectanglesToDraw;
    if (id === 'riemannLeft')  {
      x_j = 0;
    }
    else if (id === 'riemannRight') {
      x_j = width;
    }
    else if (id === 'riemannMidpoint') {
      x_j = width / 2;
    }
    for (var i = 0; i < rectanglesToDraw; i++) {
      drawRectangle(config, i * width, (i + 1) * width, 0, graphFunc(x_j));
      x_j += width;
    }
    canvasGraph(config, graphFunc, 'red', false);
  }
  // Trapezoidal sums
  else if (id === 'riemannTrapezoid' || id === 'probability') {
    initializeGraph(config);
    var trapezoidsToDraw = Math.min(400, x);
    var width = 2 / trapezoidsToDraw;
    if (id === 'riemannTrapezoid') {
      var leftX = 0;
    }
    else if (id === 'probability') {
      var leftX = -1;
    }
    var x_j = leftX;
    for (var i = 0; i < trapezoidsToDraw; i++) {
      drawTrapezoid(config, i * width + leftX, (i + 1) * width + leftX, graphFunc(x_j), graphFunc(x_j + width));
      x_j += width;
    }
    drawAxes(config, config['canvas'].width, config['canvas'].height);
    canvasGraph(config, graphFunc, 'red', false);
  }
  // Infinite series visuals
  else if (seriesVisuals.includes(id) || ('seriesVisual' in settings && settings['seriesVisual'])) {
    if (id === 'geoSeriesInteractive') {
      var ratio = round(getSliderValue(id + 'Ratio'), 2);
      var seriesSum = 1 / (1 - ratio);
      if (ratio === -1) {
        graphSettings[id]['xBounds'] = [0, 1];
      }
      else if (ratio === 1) {
        graphSettings[id]['xBounds'] = [0, 50];
      }
      else {
        var sliderMax = Math.abs(Math.abs(ratio) >= 1 ? 10000 : Math.min(100, Math.max(1, Math.ceil(seriesSum))));
        graphSettings[id]['xBounds'] = [ratio < -1 ? -sliderMax : 0, sliderMax];
      }
      get(id + 'Convergent').innerText = Math.abs(ratio) >= 1 ? 'divergent' : 'convergent';
      if (Math.abs(ratio) < 1) {
        get(id + 'SumText').innerHTML = `The sum of the infinite series is about <span class="output-value">${formatNum(1 / (1 - ratio), outputPlaces)}</span>.`;
        ;
      }
      else {
        get(id + 'SumText').innerText = '';
      }
      get(id + 'FormulaVal').innerText = formatNum(1 / (1 - ratio), outputPlaces);
    }
    initializeGraph(config, true, true);
    if (id === 'comparisonTest') {
      plotPoint(config, settings['partialSumB'](x), 0, 'red');
    }
    else if (id === 'integralTest1') {
      plotPoint(config, Math.log(x), 0, 'red');
    }
    else if (id === 'integralTest2') {
      plotPoint(config, -1/(x+1) + 1, 0, 'red');
    }
    plotPoint(config, f_x, 0, 'blue');
  }
  
  // Special handling for sliders that display additional values
  if (id === 'demo' || id === 'demoB') {
    var canvas = get('demoCanvas');
    var ctx = canvas.getContext('2d');
    updateCanvasSize(canvas);
    var base = getSliderValue('demo');
    var height = getSliderValue('demoB');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    // Scale down rectangle if canvas is less than 400px wide
    var scalingFactor = canvas.width / 400;
    ctx.rect(scalingFactor * 10, scalingFactor * 20, scalingFactor * base * 37, scalingFactor * height * 37);
    ctx.stroke();
    get('demoVal2').innerText = formatNum(base * height, outputPlaces);
  }
  else if (id === 'ivt') {
    get(id + 'C').innerText = formatNum(Math.cbrt(x - 1), outputPlaces);
    get(id + 'L').innerText = formatNum(x, outputPlaces);
  }
  else if (id === 'squeeze') {
    get(id + 'ValCos').innerText = formatNum(Math.cos(x), outputPlaces);
  }
  else if (id === 'infLimits5' || id === 'infLimits6') {
    get(id + 'Val3').innerText = formatNum(1 / (x - 3), outputPlaces);
  }
  else if (['limitFormal', 'limitFormal2'].includes(id)) {
    if (id === 'limitFormal') {
      var epsilon = 0.2;
      var delta = epsilon;
      var c = 1;
      var L = 1;
    }
    else if (id === 'limitFormal2') {
      var epsilon = 0.7;
      var delta = epsilon / 7;
      var c = 3;
      var L = 9;
    }
    get(id + 'C').innerText = formatNum(Math.abs(x - c), outputPlaces);
    get(id + 'L').innerText = formatNum(Math.abs(f_x - L), outputPlaces);
    if (Math.abs(x - c) < delta) {
      get(id + 'Delta').innerHTML = coloredText('green', `(Below delta = ${formatNum(delta, outputPlaces)})`);
    }
    else {
      get(id + 'Delta').innerHTML = coloredText('red', `(Not below delta = ${formatNum(delta, outputPlaces)})`);
    }
    if (Math.abs(f_x - L) < epsilon) {
      get(id + 'Epsilon').innerHTML = coloredText('green', `(Below epsilon = ${formatNum(epsilon, outputPlaces)})`);
    }
    else {
      get(id + 'Epsilon').innerHTML = coloredText('red', `(Not below epsilon = ${formatNum(epsilon, outputPlaces)})`);
    }
  }
  // Secant line graphs
  else if (['diffExample', 'diffExampleOtherPts', 'limitDefGraph', 'limitDefGraph2', 'diffAbility1', 'diffAbility2', 'diffAbility3', 'diffAbility4', 'diffAbility5'].includes(id)) {
    if (id === 'diffExampleOtherPts') {
      var pointX = getSliderValue(id + '1st');
      setText(id + '1stPt', `(${formatNum(pointX, inputPlaces)}, ${formatNum(func(pointX), outputPlaces)})`);
    }
    else {
      var pointX = config['pointX'];
    }
    var pointY = func(pointX);

    setText(id + '2ndPt', `(${formatNum(x, inputPlaces)}, ${formatNum(f_x, outputPlaces)})`);
    setText(id + 'Chg', formatNum(x - pointX, outputPlaces));
    setText(id + 'Slope', formatNum((graphFunc(x) - pointY) / (x - pointX), outputPlaces));
    setText(id + 'Rise', formatNum(graphFunc(x) - pointY, outputPlaces));
    setText(id + 'X', formatNum(x, outputPlaces));

    if (id === 'diffAbility3') {
      canvasGraph(config, x => x);
      plotPoint(config, 1, 3, 'red');
      plotPoint(config, 1, 1, 'red', true);
    }
    else if (id === 'diffAbility4') {
      canvasGraph(config, x => x > 0 ? 1 : NaN);
      canvasGraph(config, x => x < 0 ? -1 : NaN, 'red', false);
      plotPoint(config, 0, -1, 'red');
      plotPoint(config, 0, 1, 'red', true);
    }
    else if (id === 'diffAbility5') {
      canvasGraph(config, x => x > 0 ? 1 / x : NaN);
      canvasGraph(config, x => x < 0 ? 1 / x : NaN, 'red', false);
      plotPoint(config, 0, 0, 'red');
    }
    else {
      canvasGraph(config, graphFunc);
    }
    
    plotSecantLine(config, graphFunc, pointX, x);
    plotPoint(config, pointX, pointY, 'red');
    plotPoint(config, x, graphFunc(x));
  }
  else if (id === 'diffChain2') {
    get(id + 'Result').innerHTML = `${formatNum(Math.log(x), outputPlaces)} · ${formatNum(x, outputPlaces)}<sup>x</sup>`;
  }
  else if (id === 'diffChain2Ln') {
    if (round(Math.E, inputPlaces) === x) {
      get(id + 'Result').innerText = '1 / x';
    }
    else {
      get(id + 'Result').innerText = `1 / (${formatNum(Math.log(x), outputPlaces)}x)`;
    }
  }
  else if (['diffIntervals', 'diffIntervals2', 'diffDemo', 'concavity'].includes(id)) {
    if (id === 'diffDemo') {
      var increaseText = 'increases';
      var decreaseText = 'decreases';
      var eitherText = 'either increases, decreases, or stays the same (depending on the function’s equation)';
    }
    else {
      var increaseText = 'increasing';
      var decreaseText = 'decreasing';
      var eitherText = 'neither increasing nor decreasing';
    }
    if (id === 'concavity') {
      get(id + 'FirstDiff').innerText = formatNum(-3 * x ** 2 + 1, outputPlaces);
    }
    if (f_x === 0) {
      get(id + 'Sign').innerHTML = 'neither negative nor positive';
      get(id + 'Direction').innerHTML = eitherText;
    }
    else {
      get(id + 'Sign').innerHTML = f_x > 0 ? coloredText('green', 'positive') : coloredText('red', 'negative');
      get(id + 'Direction').innerHTML = f_x > 0 ? coloredText('green', increaseText) : coloredText('red', decreaseText);
    }
  }
  else if (['diffDemo2', 'diffDemo3'].includes(id)) {
    var funcData = interactiveFuncs[get(id + 'Select').value];
    var originalFunc = funcData['func'];
    var derivativeFunc = funcData['derivative'];
    get(id + 'FuncVal').innerText = formatNum(originalFunc(x), inputPlaces);
    get(id + 'Val2').innerText = formatNum(derivativeFunc(x), inputPlaces);
    var asymptotes = null;
    var asymptotePeriod = null;
    if ('asymptotes' in funcData) {
      asymptotes = funcData['asymptotes'];
    }
    if ('asymptotePeriod' in funcData) {
      asymptotePeriod = funcData['asymptotePeriod'];
    }

    var xBounds = [parseFloat(get(id + 'XLowerBound').value), parseFloat(get(id + 'XUpperBound').value)];
    var yBounds = [parseFloat(get(id + 'YLowerBound').value), parseFloat(get(id + 'YUpperBound').value)];
    var boundsAreFinite = isFinite(xBounds[0]) && isFinite(xBounds[1]) && isFinite(yBounds[0]) && isFinite(yBounds[1]);
    var invalidBounds = xBounds[1] < xBounds[0] || yBounds[1] < yBounds[0];
    if (boundsAreFinite && !invalidBounds) {
      config['xBounds'] = xBounds;
      config['yBounds'] = yBounds;
    }
    canvasGraph(config, originalFunc, 'red', true, asymptotes, asymptotePeriod);
    plotTangentLine(config, originalFunc, derivativeFunc, x);
    plotPoint(config, x, originalFunc(x));
    get(id + 'Formula').innerHTML = funcData['derivativeHTML'];
  }
  else if (id === 'optimization') {
    get(id + 'HP').innerText = formatNum(72 / (x - 2) + 2, outputPlaces);
  }
  else if (['accumulationIntro', 'gradeIntegral', 'improperInt', 'improperInt2', 'improperInt3', 'improperInt4', 'improperInt5', 'improperInt6'].includes(id)) {
    const integralBounds = {
      'accumulationIntro': [0, x],
      'gradeIntegral': [0, x],
      'improperInt': [0, x],
      'improperInt2': [x, 1],
      'improperInt3': [0, x],
      'improperInt4': [x, 0],
      'improperInt5': [1, x],
      'improperInt6': [1, x]
    };
    var bounds = integralBounds[id];

    initializeGraph(config);
    shadeGraph(config, graphFunc, bounds[0], bounds[1]);
    canvasGraph(config, graphFunc, 'red', false);
    plotPoint(config, x, graphFunc(x));
    if (id === 'accumulationIntro') {
      get(id + 'Dist').innerText = formatNum(f_x, outputPlaces);
    }
    if (id === 'gradeIntegral') {
      get(id + 'Grade').innerText = formatNum(f_x + 80, outputPlaces);
      get(id + 'Rate').innerText = formatNum(graphFunc(x), outputPlaces);
    }
  }
  else if (id === 'riemannAll') {
    for (var type of ['Right', 'Midpoint', 'Trapezoid']) {
      get(id + type).innerText = formatNum(riemannSum(x => x ** 2, [0, 2], x, type.toLowerCase()), outputPlaces);
    }
  }
  else if (['ftc', 'intInteractive'].includes(id)) {
    var funcData = {};
    var funcName = '';
    if (id === 'intInteractive') {
      funcName = get(id + 'Select').value;
      funcData = interactiveFuncs[funcName];
      graphFunc = funcData['func'];
      get(id + 'Val2').innerText = formatNum(funcData['antiderivative'](x), outputPlaces);
    }
    var asymptotes = null;
    var asymptotePeriod = null;
    if ('asymptotes' in funcData) {
      asymptotes = funcData['asymptotes'];
    }
    if ('asymptotePeriod' in funcData) {
      asymptotePeriod = funcData['asymptotePeriod'];
    }
    initializeGraph(config);
    const darkGreen = '#00a12a';
    const red = '#ff4040';
    shadeGraph(config, graphFunc, 0, x, x > 0 ? 'lightgreen' : red, asymptotes);
    if (funcName === 'sin') {
      if (x > Math.PI) {
        shadeGraph(config, graphFunc, Math.PI, x, 'pink', asymptotes);
      }
      if (x < 0) {
        shadeGraph(config, graphFunc, Math.max(-Math.PI, x), 0, darkGreen, asymptotes);
      }
    }
    if (funcName === 'cos') {
      if (x > Math.PI / 2) {
        shadeGraph(config, graphFunc, Math.PI / 2, Math.min(3 * Math.PI / 2, x), 'pink', asymptotes);
      }
      if (x < -Math.PI / 2) {
        shadeGraph(config, graphFunc, Math.max(-3 * Math.PI / 2, x), -Math.PI / 2, darkGreen, asymptotes);
      }
    }
    if (['x', 'lnPlus1', 'cbrt', 'cube'].includes(funcName)) {
      if (x < 0) {
        shadeGraph(config, graphFunc, x, 0, darkGreen, asymptotes);
      }
    }
    if (funcName === 'negative') {
      if (x > 0) {
        shadeGraph(config, graphFunc, 0, x, 'pink', asymptotes);
      }
    }
    if (['negative', 'square'].includes(funcName)) {
      if (x < 0) { 
        shadeGraph(config, graphFunc, x, 0, red, asymptotes);
      }
    }
    canvasGraph(config, graphFunc, 'red', false);
    plotPoint(config, x, graphFunc(x));
    get(id + 'Derivative').innerText = formatNum(graphFunc(x), outputPlaces);
    get(id + 'Func').innerText = formatNum(graphFunc(x), outputPlaces);
  }
  else if (id === 'ftcGraph') {
    initializeGraph(config);
    shadeGraph(config, graphFunc, 0, x);
    canvasGraph(config, graphFunc, 'red', false);
    plotPoint(config, x, graphFunc(x));
  }
  else if (id === 'analyzeAccumulation') {
    get(id + 'Area').innerText = formatNum(x ** 3 / 3 - 4 * x, outputPlaces);
    if (f_x === 0) {
      get(id + 'Sign').innerText = 'neither negative nor positive';
      get(id + 'Direction').innerText = 'neither increasing nor decreasing';
    }
    else {
      get(id + 'Sign').innerHTML = f_x > 0 ? coloredText('green', 'positive') : coloredText('red', 'negative');
      get(id + 'Direction').innerHTML = f_x > 0 ? coloredText('green', 'increasing') : coloredText('red', 'decreasing');
    }
    initializeGraph(config);
    if (x > 0) {
      shadeGraph(config, graphFunc, 0, Math.min(x, 2), 'pink');
      if (x > 2) {
        shadeGraph(config, graphFunc, 2, x, 'lightgreen');
      }
    }
    else {
      shadeGraph(config, graphFunc, Math.max(x, -2), 0, 'lightgreen');
      if (x < -2) {
        shadeGraph(config, graphFunc, x, -2, 'pink');
      }
    }
    canvasGraph(config, graphFunc, 'blue', false);
    plotPoint(config, x, graphFunc(x), 'red');
  }
  else if (id === 'integralSum') {
    get(id + 'Right').innerText = formatNum(-Math.cos(Math.PI) - (-Math.cos(x)), outputPlaces);
    initializeGraph(config);
    shadeGraph(config, graphFunc, 0, x);
    shadeGraph(config, graphFunc, x, Math.PI, 'lightblue');
    canvasGraph(config, graphFunc, 'red', false);
    plotPoint(config, x, graphFunc(x));
  }
  else if (id === 'partialSum1') {
    get(id + 'Sum2').innerText = `${formatNum(x)}/${formatNum(x + 4)} = ${formatNum(x / (x + 4), outputPlaces)}`;
  }
  else if (id === 'integralTest1') {
    get(id + 'XVal').innerText = formatNum(x, inputPlaces);
    get(id + 'Integral').innerText = formatNum(Math.log(x), outputPlaces);
  }
  else if (id === 'integralTest2') {
    get(id + 'Val1').innerText = formatNum(x + 1, inputPlaces);
    get(id + 'XVal').innerText = formatNum(x + 1, inputPlaces);
    get(id + 'Integral').innerText = formatNum(-1/(x+1) + 1, outputPlaces);
  }
  else if (id === 'gammaFuncXValue') {
    var xInput = round(parseFloat(get(id + 'Input').value), inputPlaces);
    if (isFinite(xInput)) {
      x = xInput;
    }
    var graphFunc = t => t ** (x - 1) * Math.exp(-t);
    if (x <= 1) {
      var xBoundRight = 5;
      var yBoundUpper = Math.max(1, graphFunc(0.25));
    }
    else {
      var max = 0;
      for (var i = 0; i < 100; i += 0.1) {
        if (graphFunc(i) > max) {
          max = graphFunc(i);
        }
      }
      var yBoundUpper = Math.max(1, 1.05 * max);
      for (var xBoundRight = 5; xBoundRight < 99.99; xBoundRight += 0.1) {
        if (graphFunc(xBoundRight) < 0.01 * yBoundUpper && graphFunc(xBoundRight + 0.1) < graphFunc(xBoundRight)) {
          break;
        }
      }
    }
    config['xBounds'] = [-0.05 * xBoundRight, xBoundRight];
    config['yBounds'] = [-0.05 * yBoundUpper, yBoundUpper];
    get(id + 'Val1').innerText = formatNum(x, inputPlaces);
    var b = round(getSliderValue('gammaFunc'), 2);
    get(id + 'Val2').innerText = formatNum(gammaIntegral(x, b), outputPlaces, maxSigFigs);
    get(id + 'Gamma').innerText = formatNum(math.gamma(x), outputPlaces, maxSigFigs);
    canvasGraph(config, graphFunc, 'red');
    shadeGraph(config, graphFunc, 0.001, b);
    plotPoint(config, b, graphFunc(b));
    drawAxes(config, config['canvas'].width, config['canvas'].height, false, true, true, ['', 'x = ' + formatNum(config['xBounds'][1], 1)], ['', 'y = ' + formatNum(config['yBounds'][1], 1)]);
  }
  else if (['gammaFuncComplex', 'riemannZeta'].includes(id)) {
    var realInput = round(parseFloat(get(id + 'Input').value), inputPlaces);
    var imagInput = round(parseFloat(get(id + 'InputImag').value), inputPlaces);
    if (isFinite(realInput) || isFinite(imagInput)) {
      if (!isFinite(realInput)) {
        realInput = 0;
      }
      if (!isFinite(imagInput)) {
        imagInput = 0;
      }
      var z = math.complex(realInput, imagInput);
    }
    else {
      var z = math.complex(round(getSliderValue(id), inputPlaces), round(getSliderValue(id + 'Imag'), inputPlaces));
    }
    get(id + 'Val1').innerText = formatNum(z, inputPlaces);
    if (id === 'gammaFuncComplex') {
      get(id + 'Val2').innerText = formatNum(math.gamma(z), outputPlaces, maxSigFigs);
    }
    else {
      // Fix bug with math.js where zeta(s) always returns NaN if z.re = 1, even if the imaginary part is nonzero
      if (z.re === 1) {
        z.re -= 1e-16;
      }
      var zetaVal = math.zeta(z);
      if (z.im === 0) {
        // Fix zeta function giving wrong values for some negative integers
        // https://en.wikipedia.org/wiki/Particular_values_of_the_Riemann_zeta_function
        var negativeOddZetaVals = {
          '-1': -1/12,
          '-3': 1/120,
          '-5': -1/252,
          '-7': 1/240,
          '-9': -1/132,
          '-11': 691/32760,
          '-13': -1/12
        };
        if (z.re % 2 === 0 && z.re < 0) {
          zetaVal = 0;
        }
        if (z.re.toString() in negativeOddZetaVals) {
          zetaVal = negativeOddZetaVals[z.re.toString()];
        }
      }
      get(id + 'Val2').innerText = formatNum(zetaVal, outputPlaces, maxSigFigs);
    }
  }
  else if (id === 'eulersConstant') {
    get(id + 'XVal').innerText = formatNum(x, inputPlaces);
    get(id + 'Integral').innerText = formatNum(Math.log(x), outputPlaces);
    get(id + 'Diff').innerText = formatNum(f_x - Math.log(x), outputPlaces);
  }
  else if (id === 'pSeriesPValue') {
    if (x > 1) {
      get(id + 'Convergent').innerText = 'convergent';
      get(id + 'Zeta').innerHTML = `The sum of the infinite series is about <span class="output-value">${formatNum(math.zeta(x), outputPlaces)}</span>.`;
    }
    else {
      get(id + 'Convergent').innerText = 'divergent';
      get(id + 'Zeta').innerHTML = '';
    }
  }
  else if (id === 'powerSeriesXValue') {
    if (x > 1 && x < 5) {
      get(id + 'Convergent').innerText = 'convergent';
      if (x === 3) {
        var sum = 0;
      }
      else {
        var sum = 2 * (-x + x * Math.log((5-x)/2) - 5 * Math.log(5-x) + 3 + Math.log(32)) / ((x-5) * (x-3));
      }
      get(id + 'Sum').innerHTML = `The sum of the infinite series is about <span class="output-value">${formatNum(sum, outputPlaces)}</span>.`;
    }
    else {
      get(id + 'Convergent').innerText = 'divergent';
      get(id + 'Sum').innerHTML = '';
    }
  }
  else if (id === 'powerSeriesFuncXValue') {
    get(id + 'Equivalent').innerText = formatNum(10 / (1 + 2 * x ** 2), outputPlaces);
    if (Math.abs(x) < 1 / Math.sqrt(2)) {
      get(id + 'Convergent').innerText = 'convergent';
      var sum = 10 / (1 + 2 * x ** 2);
      get(id + 'Sum').innerHTML = `The sum of the infinite series is about <span class="output-value">${formatNum(sum, outputPlaces)}</span>.`;
    }
    else {
      get(id + 'Convergent').innerText = 'divergent';
      get(id + 'Sum').innerHTML = '';
    }
  }
  else if (id === 'ratioTest1') {
    get(id + 'RatioTerms').innerText = `${formatNum(x - 1)} and ${formatNum(x)}`;
    if (x > 1) {
      get(id + 'Ratio').innerText = formatNum((2 * (x - 1)) / (3 * x), outputPlaces);
    }
    else {
      get(id + 'Ratio').innerText = 'N/A';
    }
  }
  else if (id === 'ratioTest2') {
    get(id + 'RatioTerms').innerText = `${formatNum(x - 1)} and ${formatNum(x)}`;
    if (x > 1) {
      get(id + 'Ratio').innerText = formatNum(ruleFunc(x) / ruleFunc(x - 1), outputPlaces);
    }
    else {
      get(id + 'Ratio').innerText = 'N/A';
    }
  }
  else if (id === 'rootTest1') {
    get(id + 'Root').innerText = formatNum(2 / x, outputPlaces);
  }
  else if (id === 'rootTest2') {
    get(id + 'Root').innerText = formatNum(2 / (x ** (1/x)), outputPlaces);
  }
  else if (['altError1', 'altError2', 'integralError1'].includes(id)) {
    var trueSum = {'altError1': Math.log(2), 'altError2': 0.901543, 'integralError1': Math.PI ** 2 / 6}[id];
    if (id.startsWith('altError')) {
      var lowerR = Math.min(ruleFunc(x + 1), 0);
      var upperR = Math.max(0, ruleFunc(x + 1));
    }
    else if (id.startsWith('integralError')) {
      var lowerR = 1 / (x + 1);
      var upperR = 1 / x;
    }

    if (lowerR !== 0) {
      if (lowerR < 0) {
        get(id + 'LowerRFrac').innerText = `= -1/${formatNum(-1/lowerR, 0)}`;
      }
      else {
        get(id + 'LowerRFrac').innerText = `= 1/${formatNum(1/lowerR, 0)}`;
      }
    }
    else {
      get(id + 'LowerRFrac').innerText = '';
    }

    if (upperR !== 0) {
      if (upperR < 0) {
        get(id + 'UpperRFrac').innerText = `= -1/${-formatNum(1/upperR, 0)}`;
      }
      else {
        get(id + 'UpperRFrac').innerText = `= 1/${formatNum(1/upperR, 0)}`;
      }
    }
    else {
      get(id + 'UpperRFrac').innerText = '';
    }

    var errorR = Math.max(Math.abs(lowerR), Math.abs(upperR));
    get(id + 'LowerR').innerText = formatNum(lowerR, outputPlaces);
    get(id + 'UpperR').innerText = formatNum(upperR, outputPlaces);
    get(id + 'ErrorR').innerText = formatNum(errorR, outputPlaces)
    get(id + 'ErrorRFrac').innerText = `= 1/${formatNum(1/errorR, 0)}`;
    get(id + 'ActualR').innerText = formatNum(trueSum - f_x, outputPlaces);
    get(id + 'LowerSum').innerText = formatNum(f_x + lowerR, outputPlaces);
    get(id + 'UpperSum').innerText = formatNum(f_x + upperR, outputPlaces);
    get(id + 'AvgSum').innerText = formatNum(f_x + (lowerR + upperR) / 2, outputPlaces);
    get(id + 'AvgError').innerText = formatNum(Math.abs(f_x + (lowerR + upperR) / 2 - trueSum), outputPlaces);
  }
  // Local linear approximations, Maclaurin/Taylor series
  else if (['localLinearity', 'localLinearity2', 'maclaurinIntro', 'lagrangeError1', 'lagrangeError2', 'taylorSin', 'taylorCos', 'taylorExp', 'taylorLn', 'taylorSinh', 'taylorCosh', 'leibnizPi'].includes(id)) {
    const taylorMaxSigFigs = 12;
    if (id === 'maclaurinIntro' || id === 'lagrangeError1') {
      var actual = Math.sin(1);
      displayPartialSum(id, n => (-1) ** (n - 1) * 1 / factorial(2 * (n - 1) + 1), slowPartialSum(n => (-1) ** (n - 1) * 1 / factorial(2 * (n - 1) + 1)), Math.ceil(x / 2), outputPlaces, true, 1, n => (n - 1) % 2 === 0 ? `+1/${2 * (n - 1) + 1}!`: `-1/${2 * (n - 1) + 1}!`);
    }
    else if (id === 'lagrangeError2') {
      var actual = Math.log(1.5);
      displayPartialSum(id, n => (-1) ** (n - 1) * 0.5 ** n / n, slowPartialSum(n => (-1) ** (n - 1) * 0.5 ** n / n), x, outputPlaces, true, 1, n => n % 2 === 0 ? `-(0.5)^${n}/${n}` : `+(0.5)^${n}/${n}`);
    }
    else if (['taylorSin', 'taylorCos', 'taylorExp', 'taylorSinh', 'taylorCosh', 'taylorLn'].includes(id)) {
      var sliderValue = parseFloat(get(id + 'XValueSlider').value);
      if (id === 'taylorSin') {
        var sliderX = round(sliderValue * 2 * Math.PI - Math.PI, 2);
        var actual = Math.sin(sliderX);
        displayPartialSum(id, n => (-1) ** (n - 1) * sliderX ** (2 * (n - 1) + 1) / factorial(2 * (n - 1) + 1), n => taylorApprox(sliderX, 'sin', 2 * (n - 1) + 1), Math.ceil(x / 2), outputPlaces, true, 1, n => n % 2 === 0 ? `-(${sliderX})^${2 * (n - 1) + 1}/${2 * (n - 1) + 1}!` : `+(${sliderX})^${2 * (n - 1) + 1}/${2 * (n - 1) + 1}!`);
      }
      else if (id === 'taylorCos') {
        var sliderX = round(sliderValue * 2 * Math.PI - Math.PI, 2);
        var actual = Math.cos(sliderX);
        displayPartialSum(id, n => (-1) ** (n - 1) * sliderX ** (2 * (n - 1)) / factorial(2 * (n - 1)), n => taylorApprox(sliderX, 'cos', 2 * (n - 1)), Math.floor(x / 2) + 1, outputPlaces, true, 1, n => n % 2 === 0 ? `-(${sliderX})^${2 * (n - 1)}/${2 * (n - 1)}!` : `+(${sliderX})^${2 * (n - 1)}/${2 * (n - 1)}!`);
      }
      else if (id === 'taylorExp') {
        var sliderX = round(sliderValue * 10 - 5, 2);
        var actual = Math.exp(sliderX);
        displayPartialSum(id, n => sliderX ** (n - 1) / factorial(n - 1), n => taylorApprox(sliderX, 'exp', n - 1), x + 1, outputPlaces, true, 1, n => `+(${sliderX})^${(n - 1)}/${(n - 1)}!`);
      }
      else if (id === 'taylorSinh') {
        var sliderX = round(sliderValue * 10 - 5, 2);
        var actual = Math.sinh(sliderX);
        displayPartialSum(id, n => sliderX ** (2 * (n - 1) + 1) / factorial(2 * (n - 1) + 1), n => taylorApprox(sliderX, 'sinh', 2 * (n - 1) + 1), Math.ceil(x / 2), outputPlaces, true, 1, n => `+(${sliderX})^${2 * (n - 1) + 1}/${2 * (n - 1) + 1}!`);
      }
      else if (id === 'taylorCosh') {
        var sliderX = round(sliderValue * 10 - 5, 2);
        var actual = Math.cosh(sliderX);
        displayPartialSum(id, n => sliderX ** (2 * (n - 1)) / factorial(2 * (n - 1)), n => taylorApprox(sliderX, 'cosh', 2 * (n - 1)), Math.floor(x / 2) + 1, outputPlaces, true, 1, n => `+(${sliderX})^${2 * (n - 1)}/${2 * (n - 1)}!`);
      }
      else if (id === 'taylorLn') {
        var sliderX = round(getSliderValue('taylorLnXValue'), 2);
        var actual = Math.log(sliderX);
        displayPartialSum(id, n => (-1) ** (n - 1) * (sliderX - 1) ** n / n, n => taylorApprox(sliderX, 'ln', n), x, outputPlaces, true, 1, n => n % 2 === 0 ? `-(${round(sliderX - 1, 2)})^${n}/${n}` : `+(${round(sliderX - 1, 2)})^${n}/${n}`, taylorMaxSigFigs);
        if (sliderX > 0 && sliderX <= 2) {
          get(id + 'Convergent').innerText = 'convergent';
          get(id + 'SumText').innerHTML = `The sum of the infinite series is about <span class="output-value">${round(Math.log(sliderX), 6)}</span>.`;
        }
        else {
          get(id + 'Convergent').innerText = 'divergent';
          get(id + 'SumText').innerHTML = '';

        }
      }
      for (var i = 1; i <= 3; i++) {
        get(id + 'X' + i.toString()).innerText = sliderX;
      }
    }
    else if (id === 'leibnizPi') {
      var actual = Math.PI;
      get(id + 'PartialSum').innerText = formatNum(f_x, outputPlaces);
    }
    else if (['localLinearity', 'localLinearity2'].includes(id)) {
      if (id === 'localLinearity') {
        var actual = x ** 2;
        var derivative = x => 2 * x;
        var a = 2;
      }
      else {
        var actual = Math.sqrt(x);
        var derivative = x => 1 / (2 * Math.sqrt(x));
        var a = 25;
      }
      get(id + 'X1').innerText = formatNum(x, inputPlaces);
      get(id + 'X2').innerText = formatNum(x, inputPlaces);
      canvasGraph(config, graphFunc);
      plotTangentLine(config, graphFunc, derivative, a, 'blue');
      plotPoint(config, x, actual, 'red');
      plotPoint(config, x, f_x, 'blue');
    }

    get(id + 'Actual').innerText = formatNum(actual, outputPlaces, taylorMaxSigFigs);
    get(id + 'Val2').innerText = formatNum(f_x, outputPlaces, taylorMaxSigFigs);

    // Display approximation error
    var error = Math.abs(actual - func(x));
    if (error < 1e-7) {
      var errorOutputPlaces = outputPlaces + 5;
      var errorSigfigs = 3;
    }
    else {
      var errorOutputPlaces = outputPlaces;
      var errorSigfigs = Infinity;
    }

    if (id === 'leibnizPi' && error < 1e-6) {
      errorOutputPlaces++;
    }

    if (error < 1e-15) {
      get(id + 'Error').innerText = 'under 10^(-15)';
    }
    else {
      get(id + 'Error').innerText = formatNum(error, errorOutputPlaces, Math.min(errorSigfigs, taylorMaxSigFigs));
    }

    if (['localLinearity', 'localLinearity2'].includes(id) && error < 0.0001) {
      if (error === 0) {
        get(id + 'Error').innerText = '0';
      }
      else {
        get(id + 'Error').innerText = 'under 0.0001';
      }
    }

    // Lagrange error bound
    if (id === 'lagrangeError1' || id === 'lagrangeError2') {
      if (id === 'lagrangeError1') {
        var lagrangeError = 1 / factorial(x + 1);
      }
      else if (id === 'lagrangeError2') {
        var lagrangeError = 1 / (2 ** (x + 1) * (x + 1));
      }
      if (lagrangeError < 1e-7) {
        var errorOutputPlaces = outputPlaces + 5;
        var errorSigfigs = 3;
      }
      else {
        var errorOutputPlaces = outputPlaces;
        var errorSigfigs = null;
      }
      get(id + 'ErrorBound').innerText = formatNum(lagrangeError, errorOutputPlaces, errorSigfigs);
    }
  }
  else if (id === 'maclaurinPlayground') {
    var funcType = get(id + 'Select').value;
    var degree = round(parseFloat(get(id + 'DegreeSlider').value) * 19 + 1);

    if (['ln', 'reciprocal'].includes(funcType)) {
      var centered = 1;
    }
    else {
      var centered = 0;
    }
    
    if (funcType === 'reciprocal') {
      var asymptote = [0];
    }
    else if (funcType === 'geometric') {
      var asymptote = [1];
    }
    else {
      var asymptote = null;
    }

    get(id + 'Centered').innerText = formatNum(centered);
    
    canvasGraph(config, taylorFuncs[funcType], 'red', true, asymptote);
    canvasGraph(config, x => taylorApprox(x, funcType, degree), 'blue', false);

    var actual = taylorFuncs[funcType](x);
    var polynomial = taylorApprox(x, funcType, degree);
    var error = Math.abs(actual - polynomial);

    plotPoint(config, x, actual, 'red');
    plotPoint(config, x, polynomial, 'blue');

    get(id + 'Actual').innerText = formatNum(actual, outputPlaces, outputPlaces + 2);
    get(id + 'Polynomial').innerText = formatNum(polynomial, outputPlaces, outputPlaces + 2);
    
    if (error < 1e-7) {
      var errorOutputPlaces = outputPlaces + 5;
      var errorSigfigs = 3;
    }
    else {
      var errorOutputPlaces = outputPlaces;
      var errorSigfigs = outputPlaces + 2;
    }

    if (error < 1e-15) {
      get(id + 'Error').innerText = 'under 10^(-15)';
    }
    else {
      get(id + 'Error').innerText = formatNum(error, errorOutputPlaces, errorSigfigs);
    }
  }
  else if (id === 'maclaurinPlaygroundDegree') {
    updateSliderValues('maclaurinPlayground', false, true);
  }
  else if (id === 'eulersFormula5') {
    initializeGraph(config);
    plotCircle(config, 1);
    plotPoint(config, Math.cos(x), Math.sin(x));
  }
  else if (id === 'hyperIntroCircle') {
    initializeGraph(config);
    shadeUnitCircle(config, x);
    drawAxes(config, config['canvas'].width, config['canvas'].height);
    plotCircle(config, 1);
    plotPoint(config, Math.cos(x), Math.sin(x));

    get(id + 'Cos').innerText = formatNum(Math.cos(x), outputPlaces);
    get(id + 'Area').innerText = formatNum(Math.abs(x / 2), outputPlaces);
    get(id + 'Coords').innerText = `(${formatNum(Math.cos(x), outputPlaces)}, ${formatNum(Math.sin(x), outputPlaces)})`
  }
  else if (id === 'hyperIntro') {
    initializeGraph(config);
    shadeUnitHyperbola(config, x);
    plotUnitHyperbola(config);
    plotPoint(config, Math.cosh(x), Math.sinh(x));

    get(id + 'Cosh').innerText = formatNum(Math.cosh(x), outputPlaces);
    get(id + 'Area').innerText = formatNum(Math.abs(x / 2), outputPlaces);
    get(id + 'Coords').innerText = `(${formatNum(Math.cosh(x), outputPlaces)}, ${formatNum(Math.sinh(x), outputPlaces)})`
  }
  else if (id === 'partialDiffX') {
    get(id + 'Derivative').innerText = formatNum(4 * x, outputPlaces);
  }
  else if (id === 'partialDiffY') {
    get(id + 'Derivative').innerText = formatNum(4, outputPlaces);
  }
}

function updateSliders(forceUpdate=false) {

  for (var sliderName of Object.keys(sliderSettings).concat(partialSumSliders)) {
    try {
      updateSliderValues(sliderName, false, forceUpdate);
    }
    catch (e) {
      console.log(`Error occurred when updating slider ID ${sliderName}: ${e}`);
      throw e;
    }
  }
}

// Keep track of the state of each sequence (what terms are currently being displayed)
var sequenceStates = {}
for (var element in sequenceSettings) {
  sequenceStates[element] = 1;
  displaySequence(element);
}

// Get all partial sum sliders
var partialSumSliders = [];
for (var seqName in sequenceSettings) {
  if ('sliderRange' in sequenceSettings[seqName]) {
    partialSumSliders.push(seqName);
  }
}

// Keep track of previous slider values so we can see which slider changes
var prevSliderValues = {}
// Regular sliders
for (var sliderName in sliderSettings) {
  prevSliderValues[sliderName] = null;
}
// Partial sum sliders
for (var sliderName of partialSumSliders) {
  prevSliderValues[sliderName] = null;
}

// Search bar functionality
var sectionTitles = {};

// Additional keywords for sections that the search feature looks at
// For example, searching for "Trig Sub" makes the Trigonometric Substitution section appear as a result
const searchKeywords = {
  'ivt': ['IVT'],
  'diffInvTrig': ['Inverse Trigonometric Functions'],
  'diffSecond': ['2nd Derivatives', 'Third Derivatives', '3rd Derivatives'],
  'mvt': ['MVT', "Rolle's Theorem"],
  'evt': ['Extremum', 'EVT'],
  'diffStrat': ['Derivative Strategies', 'Derivative Strategy', 'Differentiation Strategy'],
  'relExtrema': ['Relative Extremums', 'Relative Minima', 'Relative Minimums', 'Relative Maxima', 'Relative Maximums', 'Local Extrema', 'Local Extremums', 'Local Minima', 'Local Minimums', 'Local Maxima', 'Local Maximums'],
  'absExtrema': ['Absolute Extremums', 'Absolute Minima', 'Absolute Minimums', 'Absolute Maxima', 'Absolute Maximums', 'Global Extrema', 'Global Extremums', 'Global Minima', 'Global Minimums', 'Global Maxima', 'Global Maximums'],
  'concavity': ['Concave Up', 'Concave Down'],
  'connectingDiff': ['Derivative Graphs'],
  'diffHopital': ["L'Hopital's Rule", "L'Hospital's Rule"],
  'diffHopital2': ["L'Hopital's Rule", "L'Hospital's Rule"],
  'indefSubst': ['Integration by Substitution'],
  'defSubst': ['Integration by Substitution'],
  'sinCosInt': ['Trig Integrals'],
  'otherTrigInt': ['Trig Integrals'],
  'trigSub': ['Trig Substitution'],
  'intAvg': ['MVT'],
  'nthTermTest': ['nth-Term Test'],
  'taylorProblems': ['Maclaurin Polynomials'],
  'taylorSeries': ['Maclaurin Series'],
  'testSummary': ['Convergence Test Summary'],
  'comparisonTest': ['Direct Comparison Test', 'Limit Comparison Test']
};

// Determine title of every section
for (var element of document.getElementsByClassName('section-header')) {
  var sectionTitle = element.innerText.trim();
  sectionTitle = sectionTitle.replace(/ *(Show|Hide)$/, ''); // Remove "Show" or "Hide" from the end
  sectionTitle = sectionTitle.replace(/\\\(/g, '').replace(/\\\)/g, '').replace(/\\/g, ''); // Remove mathjax delimiters
  sectionTitles[element.id.replace(/Header$/, '')] = sectionTitle;
}

function searchForSection(query) {
  query = query.toLowerCase().replace(/’/g, "'").replace(/-/g, ' ');
  var searchResults = [];
  for (var id in sectionTitles) {
    var titlesToCheck = [sectionTitles[id]];
    // Check for keywords
    if (id in searchKeywords) {
      titlesToCheck = titlesToCheck.concat(searchKeywords[id]);
    }

    for (var sectionTitle of titlesToCheck) {
      // Typing straight apostrophes should still work
      sectionTitle = sectionTitle.toLowerCase().replace(/’/g, "'").replace(/-/g, ' ');
      if (sectionTitle.includes(query)) {
        searchResults.push(id);
        break;
      }
    }
  }
  return searchResults;
}

const maxSearchResults = 5;

function searchJumpGenerator(id) {
  // Generates a function that jumps to id and closes search window
  // Used for the search result links
  return () => {
    jumpTo(id);
    hideElement('searchPopup');
  };
}

function searchInput(showAll=false) {
  var searchQuery = get('searchInput').value;

  if (searchQuery === '') {
    return;
  }
  else if (searchQuery.toLowerCase() === 'calculus gaming') {
    get('searchMessage').innerText = 'calculus gaming indeed!';
    return;
  }

  var searchResults = searchForSection(searchQuery);
  get('searchResults').innerHTML = '';
  if (searchResults.length === 0) {
    get('searchMessage').innerText = 'No sections found.';
    return;
  }

  get('searchMessage').innerText = '';

  var resultsToShow = showAll ? searchResults.length : maxSearchResults;
  for (var id of searchResults.slice(0, resultsToShow)) {
    var headerID = id + 'Header';
    var li = document.createElement('li');
    var link = document.createElement('a');
    // Find which unit the section belongs to
    for (var unitName of unitElementIDs) {
      if (unitSections[unitName].includes(id)) {
        var unitNum = unitElementIDs.indexOf(unitName) + 1;
      }
    }
    link.innerHTML = `<strong>Unit ${unitNum}</strong>: ${sectionTitles[id]}`;
    link.href = `#${headerID}`;
    link.onclick = searchJumpGenerator(id);
    li.appendChild(link);
    get('searchResults').appendChild(li);
  }
  if (searchResults.length > maxSearchResults && !showAll) {
    var li = document.createElement('li');
    var button = document.createElement('button');
    button.innerText = `Show all results (${searchResults.length - maxSearchResults} more)`;
    button.onclick = () => searchInput(true);
    li.appendChild(button);
    get('searchResults').appendChild(li);
  }
}

function searchButton() {
  showHide('searchPopup');
  hideElement('keyboardShortcutPopup');
  toggleSidebar();
  get('searchInput').focus();
}

function keyboardShortcutButton() {
  showHide('keyboardShortcutPopup');
  hideElement('searchPopup');
  toggleSidebar();
}

// Canvas functions
function drawCircle(canvas, ctx, x, y, radius, fill=false, color='black') {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  }
  else {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

// What Is Calculus? population counter
const pageOpenedTime = Date.now();
const populationGrowthPerYear = 70e6;
const secInYear = 365.25 * 86400;

function populationIncreaseTick() {
  if (!isHidden('whyCalc')) {
    var secondsPast = (Date.now() - pageOpenedTime) / 1000;
    var populationIncrease = secondsPast / secInYear * populationGrowthPerYear;
    get('populationIncreaseAmount').innerText = formatNum(populationIncrease);
    get('populationIncreaseTime').innerText = formatNum(secondsPast);
  }
}

if (elementsExist('populationIncreaseAmount')) {
  setInterval(populationIncreaseTick, 1000 / (populationGrowthPerYear / secInYear));
}

// Length of each circle animation loop in seconds
const cycleLength = 5;
var circleAnimationConfig = graphSettings['circleAnimationGraph'];

var elementsOnScreen = {};
var lastOnScreenCheck = {};
function onScreen(element) {
  if (!(element.id in lastOnScreenCheck)) {
    lastOnScreenCheck[element.id] = 0;
  }
  if ((Date.now() - lastOnScreenCheck[element.id]) > 100 || !(element.id in elementsOnScreen)) {
    var rect = element.getBoundingClientRect(); 
    var elementOnScreen = rect.width > 0 && rect.top >= -element.height && rect.bottom <= window.innerHeight;
    elementsOnScreen[element.id] = elementOnScreen;
    lastOnScreenCheck[element.id] = Date.now();
    return elementOnScreen;
  }
  return elementsOnScreen[element.id];
}

function circleAnimation(canvas, ctx) {
  var canvasOnScreen = onScreen(canvas);
  if (canvas.id !== 'circleAnimationCanvas2' && !canvasOnScreen) {
    return;
  }
  if (canvasOnScreen || (canvas.id === 'circleAnimationCanvas2' && onScreen(get('circleAnimationGraphCanvas')))) {
    var canvasWidth = canvas.width;
    var secondsSincePageOpened = (Date.now() - pageOpenedTime) / 1000;
    // Seconds into the cycle
    var cycleSeconds = secondsSincePageOpened % cycleLength;
    var circleX = (Math.sin(cycleSeconds / cycleLength * 2 * Math.PI) + 1) / 2;
    var circlePixelX = (circleX * 1.2 - 0.1) * canvasWidth;
    drawCircle(canvas, ctx, circlePixelX, canvas.height / 2, 15, true, darkModeEnabled ? '#f3f3f3' : 'black');
    if (canvas.id === 'circleAnimationCanvas2') {
      get('circleAnimation2Pos').innerText = formatNum(circlePixelX, 0);
      get('circleAnimation2Vel').innerText = formatNum(1.2 * canvasWidth * Math.PI / cycleLength * Math.cos(cycleSeconds / cycleLength * 2 * Math.PI), 0);
      var func = circleAnimationConfig['func'];
      canvasGraph(circleAnimationConfig, func);
      var pointX = cycleSeconds / cycleLength * 2 * Math.PI;
      plotPoint(circleAnimationConfig, pointX, func(pointX));
      plotTangentLine(circleAnimationConfig, func, circleAnimationConfig['derivative'], pointX);
    }
  }
}

if (elementsExist(['circleAnimationCanvas', 'circleAnimationCanvas2'])) {
  var circleAnimationCanvas = get('circleAnimationCanvas');
  var circleAnimationCtx = circleAnimationCanvas.getContext('2d');
  setInterval(() => circleAnimation(circleAnimationCanvas, circleAnimationCtx), 1000 / 60);
  var circleAnimationCanvas2 = get('circleAnimationCanvas2');
  var circleAnimationCtx2 = circleAnimationCanvas2.getContext('2d');
  setInterval(() => circleAnimation(circleAnimationCanvas2, circleAnimationCtx2), 1000 / 60);
}

// Unit 3 Antimatter Dimensions game
var antimatter = 10;
var displayedAntimatter = 10;
var dimensionCounts = {1: 0, 2: 0, 3: 0};
var displayedDimensionCounts = {1: 0, 2: 0, 3: 0};
var dimensionPrices = {1: 10, 2: 200, 3: 5000};
const dimensionCostMultiplier = 1.15;
const dimensionTips = {
  1: {
    1: 'Your 1st dimension is producing antimatter at a rate of 1 per second! Once you save up enough antimatter, buy another 1st dimension.',
    2: 'You have two 1st dimensions, and they are each producing 1 antimatter per second. So you’re now making 2 antimatter per second!',
    3: 'You now have three 1st dimensions, and you’re making 3 antimatter per second. Do you see a pattern?',
    4: 'You now have four 1st dimensions, and you’re making 4 antimatter per second. The number of 1st dimensions tells you how much antimatter you’re making per second.',
    5: 'You could say that the number of 1st dimensions represents the rate of change of your antimatter. In other words, the number of 1st dimensions is the derivative of your antimatter with respect to time.',
    10: 'Maybe it’s time to save up for a 2nd dimension now. What do you think this 2nd dimension will do?'
  },
  2: {
    1: 'This second dimension produces 1st dimensions at a rate of 1 per second! So now the number of 1st dimensions you have is growing.',
    2: 'Notice how your antimatter is going up faster and faster (i.e. it’s accelerating). This is because the rate of change of your antimatter is itself increasing!',
    3: 'The number of 2nd dimensions tells you the rate of change of your 1st dimensions.',
    4: 'Your 2nd dimension count is the derivative of your 1st dimensions with respect to time.',
    5: 'Because your 2nd dimension count is the derivative of your 1st dimensions with respect to time, and your 1st dimension count is the derivative of your antimatter, this means that the number of 2nd dimensions is the second derivative of your antimatter with respect to time!',
    8: 'Because your 2nd dimension count is the derivative of your 1st dimensions with respect to time, and your 1st dimension count is the derivative of your antimatter, this means that the number of 2nd dimensions is the second derivative of your antimatter with respect to time! Now it’s time to save up for a 3rd dimension.'
  },
  3: {
    1: 'The 3rd dimension does exactly what you would expect: it produces a 2nd dimension each second.',
    2: 'The number of 3rd dimensions is the derivative of your second dimensions with respect to time.',
    3: 'The number of 3rd dimensions is the first derivative of your second dimensions with respect to time. This means that the number of 3rd dimensions is the second derivative of the number of 1st dimensions.',
    4: 'The number of 3rd dimensions is the first derivative of your second dimensions with respect to time. This means that the number of 3rd dimensions is the second derivative of the number of 1st dimensions. And that means that the number of 3rd dimensions is the third derivative of your antimatter with respect to time!',
    10: 'The number of 3rd dimensions is the first derivative of your second dimensions with respect to time. This means that the number of 3rd dimensions is the second derivative of the number of 1st dimensions. And that means that the number of 3rd dimensions is the third derivative of your antimatter with respect to time! (There isn’t any more text after this, so feel free to stop playing.)'
  }
}

function buyDimension(dim) {
  if (antimatter < dimensionPrices[dim]) {
    return;
  }
  antimatter -= dimensionPrices[dim];
  dimensionCounts[dim]++;
  dimensionPrices[dim] *= dimensionCostMultiplier;
  if (dimensionCounts[dim] in dimensionTips[dim]) {
    get('antidimsTip').innerText = dimensionTips[dim][dimensionCounts[dim]];
  }
  if (AD_interval === null) {
    AD_interval = setInterval(antidimsGameLoop, 1000 / AD_ticksPerSecond);
  }
  get(`antidim${dim}Button`).innerText = `Buy ${ordinals[dim]} dimension (${formatNum(dimensionPrices[dim])} antimatter)`;
}

const ordinals = ['', '1st', '2nd', '3rd'];
const AD_ticksPerSecond = 30;
var AD_interval = null;

function antidimsGameLoop() {
  antimatter += dimensionCounts[1] / AD_ticksPerSecond;
  dimensionCounts[1] += dimensionCounts[2] / AD_ticksPerSecond;
  dimensionCounts[2] += dimensionCounts[3] / AD_ticksPerSecond;
  if (!isHidden('antidims') || dimensionCounts[1] === 0) {
    for (var dim = 1; dim <= 3; dim++) {
      if (antimatter >= dimensionPrices[dim]) {
        get(`antidim${dim}Button`).disabled = false;
      }
      else {
        get(`antidim${dim}Button`).disabled = true;
      }

      if (round(dimensionCounts[dim]) !== displayedDimensionCounts[dim]) {
        // update dimension counts if they've visually changed
        if (dimensionCounts[dim] === 1) {
          get(`antidim${dim}`).innerText = `You have 1 ${ordinals[dim]} dimension.`
        }
        else {
          get(`antidim${dim}`).innerText = `You have ${formatNum(dimensionCounts[dim])} ${ordinals[dim]} dimensions.`
        }
        displayedDimensionCounts[dim] = round(dimensionCounts[dim]);
      }

      if (round(antimatter) !== displayedAntimatter) {
        // update antimatter if it's visually changed
        get('antimatter').innerText = `You have ${formatNum(antimatter)} antimatter.`;
        displayedAntimatter = round(antimatter);
      }
    }
  }
}

if (elementsExist('antidims')) {
  antidimsGameLoop();
  for (var dim = 1; dim <= 3; dim++) {
    get(`antidim${dim}Button`).innerText = `Buy ${ordinals[dim]} dimension (${formatNum(dimensionPrices[dim])} antimatter)`;
  }
}

// Unit 4 derivative button interactivity
var diffAppsFirstClicked = null;
var diffAppsLastClicked = null;
var diffAppsClickCount = 0;
function diffAppsButton() {
  var currentTime = Date.now();
  if (diffAppsLastClicked === null) {
    diffAppsLastClicked = currentTime;
    diffAppsFirstClicked = currentTime;
  }
  else {
    get('diffAppsClickSpeed').innerText = formatNum(1000 / (currentTime - diffAppsLastClicked), 1);
    diffAppsLastClicked = currentTime;
  }

  diffAppsClickCount++;
  get('diffAppsClickCount').innerText = diffAppsClickCount;

  var totalSeconds = (currentTime - diffAppsFirstClicked) / 1000;
  get('diffAppsTimeElapsed').innerText = formatNum(totalSeconds, 1);
  if (diffAppsClickCount >= 2) {
    get('diffAppsAvgSpeed').innerText = formatNum((diffAppsClickCount - 1) / totalSeconds, 1);
  }
}

// Unit 4 related rates simulation
// RRS = related rate simulation
const RRS_startingRadius = 0;
const RRS_growthRate = 1;
const RRS_simulationSpeed = 0.5;
const RRS_t0Radius = 2;
const RRS_endingRadius = 4;
const RRS_ticksPerSecond = 30;
const RRS_initialTime = (RRS_startingRadius - RRS_t0Radius) / RRS_growthRate;
const RRS_circleScale = 15;
// Related rate simulation variables
var RRS_radius = null;
var RRS_time = null;
var RRS_canvas = null;
var RRS_ctx = null;
if (elementsExist('relatedRatesSimCanvas')) {
  RRS_canvas = get('relatedRatesSimCanvas');
  RRS_ctx = RRS_canvas.getContext('2d');
}

function relatedRateSimTick() {
  RRS_time += RRS_simulationSpeed / RRS_ticksPerSecond;
  RRS_radius = RRS_t0Radius + RRS_growthRate * RRS_time;
  if (RRS_radius > RRS_endingRadius) {
    RRS_radius = RRS_endingRadius;
    RRS_time = RRS_initialTime + RRS_endingRadius / RRS_growthRate;
  }

  drawCircle(RRS_canvas, RRS_ctx, RRS_canvas.width / 2, RRS_canvas.height / 2, RRS_radius * RRS_circleScale, false, darkModeEnabled ? '#f3f3f3': 'black');
  var RRS_area = Math.PI * RRS_radius ** 2;
  var RRS_areaGrowth = 2 * Math.PI * RRS_radius;
  var timeString = `${formatNum(RRS_time, 2)} seconds`;
  if (round(RRS_time, 2) === 0) {
    timeString += ' (paused)';
  }
  get('relatedRateSimTime').innerText = timeString;
  get('relatedRateSimRadius').innerText = `${formatNum(RRS_radius, 2)} meters`;
  get('relatedRateSimArea').innerText = formatNum(RRS_area, 2);
  get('relatedRateSimAreaGrowth').innerText = `${formatNum(RRS_areaGrowth, 2)} ≈ ${formatNum(RRS_areaGrowth/ Math.PI, 2)}`;
  
  if (round(RRS_radius, 2) === RRS_t0Radius) {
    clearInterval(RRS_interval);
    setTimeout( () => {RRS_interval = setInterval(relatedRateSimTick, 1000 / RRS_ticksPerSecond)}, 3000);
  }
  
  if (RRS_radius === RRS_endingRadius) {
    clearInterval(RRS_interval);
    get('relatedRateSimButton').disabled = false;
    get('relatedRateSimRestart').innerText = 'Click the “Start Simulation” button again to restart the simulation.';
    return;
  }
}

function relatedRateSim() {
  RRS_time = RRS_initialTime;
  RRS_interval = setInterval(relatedRateSimTick, 1000 / RRS_ticksPerSecond);
  get('relatedRateSimButton').disabled = true;
  get('relatedRateSimRestart').innerText = "";
}


// "Page flipping" interactivity
// Used for Unit 5 curve sketching and Unit 7 Euler's method
const lastPages = {
  'curveSketch': 7,
  'eulersMethod': 6
}

var currentPages = {
  'curveSketch': 1,
  'eulersMethod': 1
}

function pageFlipToggle(lesson, mode) {
  var currentPage = currentPages[lesson];
  var lastPage = lastPages[lesson];
  if (mode === 'next') {
    if (currentPage >= lastPage) {
      return;
    }
    currentPages[lesson]++;
    currentPage++;
  }
  else {
    if (currentPage <= 1) {
      return;
    }
    currentPages[lesson]--;
    currentPage--;
  }

  for (var page = 1; page <= lastPage; page++) {
    if (page !== currentPage) { 
      hideElement(`${lesson}${page}`);
    }
  }
  showElement(`${lesson}${currentPage}`);
}

// Unit 7 differential equation simulations
var diffEqVars = {
  'Interest': {
    'started': false,
    'time': 0,
    'interval': null
  },
  'PopulationExp': {
    'started': false,
    'time': 0,
    'interval': null
  },
  'PopulationLog': {
    'started': false,
    'time': 0,
    'interval': null
  }
}

const diffEqSettings = {
  'Interest': {
    'start': 1000,
    'rate': 0.1,
    'timePeriod': 50,
    'speedMultiplier': 1
  },
  'PopulationExp': {
    'start': 1000,
    'rate': 0.2,
    'timePeriod': 100,
    'speedMultiplier': 2
  },
  'PopulationLog': {
    'start': 1000,
    'max': 10000,
    'rate': 0.2,
    'timePeriod': 50,
    'speedMultiplier': 1
  }
}

const diffEqTicksPerSecond = 30;

function diffEqTick(name) {
  var eqVars = diffEqVars[name];
  var eqSettings = diffEqSettings[name];
  var yearsPerSecond = (parseFloat(get(`diffEq${name}Slider`).value) *
  5.5 + 0.5) * eqSettings['speedMultiplier'];  
  diffEqVars[name]['time'] += yearsPerSecond / diffEqTicksPerSecond;
  if (eqVars['time'] > eqSettings['timePeriod']) {
    diffEqVars[name]['time'] = eqSettings['timePeriod'];
  }

  var P0 = eqSettings['start'];
  var r = eqSettings['rate'];
  var t = eqVars['time'];
  if (name === 'PopulationLog') {
    // Logistic model
    var K = eqSettings['max'];
    var currentValue = (P0 * K) / ((K - P0) * Math.exp(-r * t) + P0);
    var growthRate = r * currentValue * (1 - currentValue / K);
  }
  else {
    // Exponential model
    var currentValue = P0 * Math.exp(r * t);
    var growthRate = r * currentValue;
  }

  get(`diffEq${name}Time`).innerText = formatNum(eqVars['time'], 1);
  get(`diffEq${name}Value`).innerText = formatNum(currentValue);
  get(`diffEq${name}GrowthRate`).innerText = formatNum(growthRate);
  
  if (eqVars['time'] === eqSettings['timePeriod']) {
    clearInterval(eqVars['interval']);
    diffEqVars[name]['started'] = false;
    var startButton = get(`diffEq${name}Button`);
    startButton.disabled = false;
    get(`diffEq${name}Restart`).innerText = `Click the "${startButton.innerText}" button again to restart the simulation.`;
    return;
  }
}

function diffEqSim(name) {
  if (diffEqVars[name]['started']) {
    return;
  }
  diffEqVars[name]['time'] = 0;
  diffEqVars[name]['started'] = true;
  diffEqVars[name]['interval'] = setInterval(() => diffEqTick(name), 1000 / diffEqTicksPerSecond);
  get(`diffEq${name}Button`).disabled = true;
  get(`diffEq${name}Restart`).innerText = "";
}


// Unit 7 Euler's method
const eulersMethodMaxRows = 11;

function eulersMethod(id, solutionFunc, derivativeFunc, initialCondition, delta) {
  var nextTenth = 0;
  var intervals = round(1 / delta);
  var eulersMethodTable = get(id + 'Table');

  while (eulersMethodTable.rows.length > 1) {
    // Delete all but first row
    eulersMethodTable.deleteRow(1);
  }

  var x = initialCondition[0];
  var approxY = initialCondition[1];
  var trueY = solutionFunc(x);
  var approxDerivative = derivativeFunc(x, approxY);
  var trueDerivative = derivativeFunc(x, trueY);
  var error = Math.abs(trueY - approxY);

  for (var tick = 0; tick < intervals; tick++) {
    if (delta > 0.1 - 1e-6 || tick === round(intervals / 10 * nextTenth)) { 
      // Only create one row for every 10th of the way through (so max 11 non-header rows)
      var row = eulersMethodTable.insertRow(eulersMethodTable.rows.length);
      var rowData = [x, approxY, approxDerivative, trueY, trueDerivative, error];
      for (var cellNum = 0; cellNum < rowData.length; cellNum++) {
        var cell = row.insertCell(cellNum);
        cell.innerText = formatNum(rowData[cellNum], 3, null, 5);
      }
      lastRowX = x;
      nextTenth++;
    }
    approxY += delta * derivativeFunc(x, approxY);
    x += delta;
    approxDerivative = derivativeFunc(x, approxY);
    trueY = solutionFunc(x);
    trueDerivative = derivativeFunc(x, trueY);
    error = Math.abs(trueY - approxY);
  }

  // Fill up to (max - 1) rows
  for (var rowNum = eulersMethodTable.rows.length; rowNum <= eulersMethodMaxRows - 1; rowNum++) {
    var row = eulersMethodTable.insertRow(eulersMethodTable.rows.length);
    for (var i = 0; i < 6; i++) {
      var cell = row.insertCell(i);
      cell.innerText = '\xa0'.repeat(5); // non-breaking spaces
    }
  }

  // one last row for x = 1
  row = eulersMethodTable.insertRow(eulersMethodTable.rows.length);
  var rowData = [x, approxY, approxDerivative, trueY, trueDerivative, error];
  for (var cellNum = 0; cellNum < rowData.length; cellNum++) {
    var cell = row.insertCell(cellNum);
    cell.innerText = formatNum(rowData[cellNum], 3, null, 5);
  }
}

const eulersMethodFuncs = {
  'eulersMethod': {
    'solutionFunc': x => Math.exp(x),
    'diffFunc': (x, y) => y,
    'initialCondition': [0, 1],
    'maxIntervals': 1000
  },
  'eulersMethod2': {
    'solutionFunc': x => (9 / Math.exp(2)) * Math.exp(x) - x - 1, // Solution to differential eq. dy/dx = x+y with initial condition (2, 6)
    'diffFunc': (x, y) => x + y,
    'initialCondition': [2, 6],
    'maxIntervals': 10000
  }
}

function eulersMethodSlider() {
  for (var id of ['eulersMethod', 'eulersMethod2']) {
    var settings = eulersMethodFuncs[id];
    var sliderValue = get(id + 'Slider').value;
    var intervals = round(Math.exp(Math.log(settings['maxIntervals']) * (1 - sliderValue)));
    get(id + 'SliderDisplay').innerText = formatNum(1 / intervals, 4);
    eulersMethod(id, settings['solutionFunc'], settings['diffFunc'], settings['initialCondition'], 1 / intervals);
  }
}

if (elementsExist('eulersMethodTable')) {
  eulersMethodSlider();
}

// Keyboard shortcut functions
const shiftKeys = '!@#$%^&*()';
const topRowKeys = 'QWERTYUIOP';
function keyToUnit(key) {
  if (shiftKeys.includes(key)) {
    var unit = shiftKeys.indexOf(key) + 1;
  }
  else if (topRowKeys.includes(key)) {
    var unit = topRowKeys.indexOf(key) + 1;
  }
  else if (isFinite(key)) {
    var unit = parseInt(key);
  }
  else if (key === '-') {
    var unit = 11;
  }
  else {
    return null;
  }

  if (unit === 0) {
    unit = 10;
  }
  return unitElementIDs[unit - 1].replace('Unit', '');
}

function keyboardShortcut(event) {
  if (event.key === 'Escape') {
    for (var id of ['search', 'intro', 'keyboardShortcut']) {
      if (!isHidden(id + 'Popup')) {  
        showHide(id + 'Popup');
      }
    }
  }

  if (!isHidden('searchPopup') && event.key === 'Enter') {
    var searchInput = get('searchInput').value;
    var topHit = searchForSection(searchInput)[0];
    if (topHit !== undefined && searchInput !== '') {
      jumpTo(topHit.replace(/Header$/, ''));
      hideElement('searchPopup');
    }
  }
  // If user is typing in an input element, disable keyboard shortcuts
  if (['number', 'text'].includes(document.activeElement.type)) {
    return;
  }
  var key = event.key;
  if (key === '`') {
    get('websiteHeader').scrollIntoView();
    return;
  }
  else if (key === '\\') {
    showElement('what');
    showElement('progress');
    get('progressButton').innerText = customTextButtons['progress']['hideText'];
    get('progressButton').scrollIntoView();
  }
  else if (key === ']') {
    showElement('updateHistory');
    get('updateHistoryHeader').scrollIntoView();
  }
  else if (key === 's') {
    event.preventDefault();
    searchButton();
  }
  else if (key === 'S') {
    showElement('settings');
    get('settingsHeader').scrollIntoView();
  }
  else if (key === 'K') {
    keyboardShortcutButton();
  }
  else if (key === 'D') {
    toggleDarkMode();
  }
  else if ('_+{}|'.includes(key)) {
    for (var unit of unitElementIDs) {
      var rawUnitName = unit.replace('Unit', '');
      if (key === '_') {
        toggleAllSections(rawUnitName, 'hide');
      }
      else if (key === '+') {
        hideElement(rawUnitName);
      }
      else if (key === '{') {
        toggleAllSections(rawUnitName, 'show');
      }
      else if (key === '}') {
        showUnit(rawUnitName);
      }
      else if (key === '|') {
        for (var element of ['toc', 'updateHistory', 'what', 'links', 'whyCalc']) {
          hideElement(element);
        }
      }
    }
    updateFooter();
    return;
  }

  var unitName = keyToUnit(key);
  if (unitName === null) {
    return;
  }

  // Number keys
  jumpTo(unitName);
  // Shift + Number keys
  if (shiftKeys.includes(key)) {
    toggleAllSections(unitName, 'hide');
  }
  // Top row keys
  if (topRowKeys.includes(key)) {
    toggleAllSections(unitName, 'show');
  }

  updateFooter();
}

var elementsHiddenByDefault = [];
for (var element of document.getElementsByClassName('hidden-by-default')) {
  elementsHiddenByDefault.push(element.id);
}

// Show All Features button on What Is This Website section
function showAllFeatures() {
  hideElement('importantFeatures');
  showElement('allFeatures');
}

// Custom text button text

// Elements that are hidden because they are formal definitions
// Stored in the format {[id]: [concept name]}
var formalElements = {
  'continuityFormal': 'continuity',
  'ivtFormal': 'IVT'
};

for (var element in formalElements) {
  customTextButtons[element] = {
    'showText': `Give me a formal definition of ${formalElements[element]}.`,
    'hideText': 'Hide Formal Definition'
  };
}

// Automatically figure out custom button text based on ids
for (var element of elementsHiddenByDefault) {
  if (element in customTextButtons) {
    continue;
  }
  // Hint elements
  if (element.endsWith('Hint')) {
    customTextButtons[element] = {
      'showText': 'Give me a hint!',
      'hideText': 'Hide Hint'
    };
  }
  // Reveal elements: elements that are hidden under a "Show me the answer!" button
  else if (element.endsWith('Reveal')) {
    customTextButtons[element] = {
      'showText': 'Show me the answer!',
      'hideText': 'Hide Answer'
    };
  }
  // Infinite sum visuals
  else if (element.endsWith('SumVisual')) {
    customTextButtons[element] = {
      'showText': 'Visualize this sum for me!',
      'hideText': 'Hide Visualization'
    };
  }
  // Full work elements
  else if (element.endsWith('Work')) {
    customTextButtons[element] = {
      'showText': 'Show Full Work',
      'hideText': 'Hide Full Work'
    };
  }
}

function updateFooter() {
  if (Date.now() < lastUpdateFooter + 100 || !elementsExist('footerLink')) {
    // Only want this to run every 100ms
    return;
  }
  lastUpdateFooter = Date.now();
  var newUnit = getCurrentUnit();
  if (newUnit !== currentUnit && newUnit !== undefined) {
    currentUnit = newUnit;
    get('footerLink').href = '#' + newUnit;
    get('footerLink').innerText = `Top of Unit ${unitElementIDs.indexOf(newUnit) + 1}`;
  }
}

function toggleSidebar() {
  var sidebarClassList = get('sidebar').classList;
  var menuIconClassList = get('menuIcon').classList;
  if (sidebarClassList.contains('sidebar-hidden')) {
    // reveal sidebar
    sidebarClassList.remove('sidebar-hidden');
    menuIconClassList.add('menu-icon-shifted');
    menuIconClassList.remove('menu-icon-normal');
    hideElement('hamburgerIcon', null, null, false);
    showElement('xIcon', null, null, false);
  }
  else {
    // hide sidebar
    sidebarClassList.add('sidebar-hidden');
    menuIconClassList.remove('menu-icon-shifted');
    menuIconClassList.add('menu-icon-normal');
    hideElement('xIcon', null, null, false);
    showElement('hamburgerIcon', null, null, false);
  }
}

// Elements manually hidden/shown by the user
// Saved to localStorage so that it remains hidden/shown after reloading/revisiting the page
var hiddenElements = [];
var shownElements = [];

if (localStorage.getItem('hiddenElements') !== null) {
  try {
    hiddenElements = JSON.parse(localStorage.getItem('hiddenElements'));
  }
  // If data is corrupted, delete it
  catch (e) {
    localStorage.removeItem('hiddenElements');
  }
}

if (localStorage.getItem('shownElements') !== null) {
  try {
    shownElements = JSON.parse(localStorage.getItem('shownElements'));
  }
  catch (e) {
    localStorage.removeItem('shownElements');
  }
}

// Elements in hiddenElements that don't actually exist for some reason; maybe I changed the name of an element or I removed a section
var badElements = [];

// Don't hide elements that are already hidden by default, and don't show elements that are shown by default
hiddenElements = hiddenElements.filter(element => !elementsHiddenByDefault.includes(element));
shownElements = shownElements.filter(element => elementsHiddenByDefault.includes(element));

function resetStorage() {
  localStorage.removeItem('hiddenElements');
  localStorage.removeItem('shownElements');
  localStorage.removeItem('lastUpdateDate');
  localStorage.removeItem('darkMode');
  localStorage.removeItem('graphsInverted');
}

var darkModeEnabled = false;
const darkModeColors = ['red', 'blue', 'green', 'purple', 'teal', 'gray', 'black', 'magenta', 'bc-only-color', 'bonus-color', 'interactive-color', 'lesson-complete', 'lesson-incomplete', 'external-link', 'problem', 'sidebar-button', 'footer', 'footer-link', 'warning'];
const mathjaxColors = ['red', 'blue', 'green', 'purple', 'teal', 'magenta'];

function toggleDarkModeTextColors(mathjaxUpdate=false) {
  if (mathjaxUpdate) {
    var colors = mathjaxColors;
  }
  else {
    var colors = darkModeColors;
  }

  for (var color of colors) {
    for (var element of getClassElements(color)) {
      var colorDarkMode = color + '-dark-mode';
      if (darkModeEnabled && !mathjaxUpdate) {
        element.classList.remove(colorDarkMode);
      }
      else if (!element.classList.contains(colorDarkMode)) {
        element.classList.add(colorDarkMode);
      }
    }
  }
}

function toggleDarkMode() {
  if (darkModeEnabled) {
    get('body').classList.remove('body-dark-mode');
    get('sidebar').classList.remove('sidebar-dark-mode');
    get('keyboardIcon').src = 'images/keyboard.svg';
    get('searchIcon').src = 'images/search.svg';
    get('logo').src = 'images/logo_transparent.png';
    get('sidebarLogo').src = 'images/logo_transparent.png';
    for (var element of getClassElements(['sn', 'sidenote'])) {
      element.classList.remove('sidenote-dark-mode');
    }
    for (var element of document.getElementsByTagName('table')) {
      element.classList.remove('table-dark-mode')
    }
    for (var element of document.getElementsByTagName('th')) {
      element.classList.remove('table-dark-mode')
    }
    for (var element of document.getElementsByTagName('td')) {
      element.classList.remove('table-dark-mode')
    }
    for (var element of document.getElementsByTagName('button')) {
      element.classList.remove('button-dark-mode')
    }
    for (var element of document.getElementsByTagName('a')) {
      if (!element.classList.contains('external-link')) {
        element.classList.remove('internal-link-dark-mode')
      }
    }
  }
  else {
    get('body').classList.add('body-dark-mode');
    get('sidebar').classList.add('sidebar-dark-mode');
    get('keyboardIcon').src = 'images/keyboard_dark_mode.svg';
    get('searchIcon').src = 'images/search_dark_mode.svg';
    get('logo').src = 'images/logo_dark_transparent.png';
    get('sidebarLogo').src = 'images/logo_dark_transparent.png';
    for (var element of getClassElements(['sn', 'sidenote'])) {
      element.classList.add('sidenote-dark-mode');
    }
    for (var element of document.getElementsByTagName('table')) {
      element.classList.add('table-dark-mode')
    }
    for (var element of document.getElementsByTagName('th')) {
      element.classList.add('table-dark-mode')
    }
    for (var element of document.getElementsByTagName('td')) {
      element.classList.add('table-dark-mode')
    }
    for (var element of document.getElementsByTagName('button')) {
      element.classList.add('button-dark-mode')
    }
    for (var element of document.getElementsByTagName('a')) {
      if (!element.classList.contains('external-link')) {
        element.classList.add('internal-link-dark-mode')
      }
    }
  }
  toggleDarkModeTextColors();
  darkModeEnabled = !darkModeEnabled;
  if (darkModeEnabled) {
    get('darkModeCheckbox').checked = true;
  }
  else {
    get('darkModeCheckbox').checked = false;
  }
  localStorage.setItem('darkMode', darkModeEnabled);
  updateSliders(true);
}

// Force Mathjax colors to update to dark mode when they are loaded
function updateMathjaxColors() {
  if (darkModeEnabled) {
    toggleDarkModeTextColors(true);
  }
}

setInterval(updateMathjaxColors, 250);

var graphsInverted = false;
function invertGraphs() {
  for (var element of getClassElements(['graph', 'small-graph', 'large-graph'])) {
    if (graphsInverted) {
      element.classList.remove('inverted');
    }
    else {
      element.classList.add('inverted');
    }
  }
  graphsInverted = !graphsInverted;
  if (graphsInverted) {
    get('invertColorsCheckbox').checked = true;
  }
  else {
    get('invertColorsCheckbox').checked = false;
  }
  localStorage.setItem('graphsInverted', graphsInverted);
}

function setLargeNumFormat() {
  largeNumFormat = get('largeNumFormat').value;
  localStorage.setItem('largeNumFormat', largeNumFormat);
}

function setBackgroundImage(url) {
  get('backgroundImage').style.backgroundImage = `url(${url})`;
}

function setOpacity(opacity) {
  get('backgroundImage').style.filter = `opacity(${opacity})`;
}

function setBackgroundSize(size) {
  get('backgroundImage').style.backgroundSize = `${size}px`;
}

// Display and automatically calculate the progress table
if (elementsExist('progressTable')) {
  var table = get('progressTable');
  var abLessonsCompleted = 0;
  var bcLessonsCompleted = 0;
  var abLessonsTotal = 0;
  var bcLessonsTotal = 0;

  for (var row = 1; row <= 10; row++) {
    var rowCells = table.rows[row].cells;

    var abCompleted = 0;
    var bcCompleted = 0;
    var abTotal = 0;
    var bcTotal = 0;
    for (var lesson of get('progress' + row.toString()).getElementsByTagName('li')) {
      if (lesson.classList.contains('optional')) {
        continue;
      }
      abTotal++;
      bcTotal++;
      if (lesson.classList.contains('lesson-complete')) {
        abCompleted++;
        bcCompleted++;
      }

      if (lesson.classList.contains('calc-bc-only')) {
        abTotal--;
        if (lesson.classList.contains('lesson-complete')) {
          abCompleted--;
        }
      }
    }

    if (rowCells[1].innerText !== 'N/A') {
      abLessonsCompleted += abCompleted;
      abLessonsTotal += abTotal;
      rowCells[1].innerText = `${abCompleted}/${abTotal}`;
      if (abCompleted === abTotal) {
        rowCells[1].classList.add('green');
      }
    }
    bcLessonsCompleted += bcCompleted;
    bcLessonsTotal += bcTotal;
    rowCells[2].innerText = `${bcCompleted}/${bcTotal}`;
    if (bcCompleted === bcTotal) {
      rowCells[2].classList.add('green');
    }
  }

  var abPct = round(abLessonsCompleted / abLessonsTotal * 100);
  var bcPct = round(bcLessonsCompleted / bcLessonsTotal * 100);

  get('calcABProgress').innerText = `${abLessonsCompleted}/${abLessonsTotal} (${abPct}%)`;
  get('calcBCProgress').innerText = `${bcLessonsCompleted}/${bcLessonsTotal} (${bcPct}%)`;
}

// Display the "X Days Ago" text in update history
if (elementsExist('updateHistory')) {
  // Get the date of the most recent update by getting the header of the last update
  var mostRecentUpdate = get('updateHistory').getElementsByTagName('h3')[0];
  var lastUpdateDateStr = mostRecentUpdate.innerText.split(':')[0];
  var dateParts = lastUpdateDateStr.split('-');
  var lastUpdateDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  var now = new Date();
  // Get local date, ignoring time
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msInDay = 86400 * 1000;
  var daysAgo = Math.round((today - lastUpdateDate) / msInDay);
  if (daysAgo === 0) {
    get('updateDays').innerText = 'Today';
  }
  else if (daysAgo === 1) {
    get('updateDays').innerText = 'Yesterday';
  }
  else {
    get('updateDays').innerText = `${daysAgo} days ago`;
  }

  // If there's been an update since the user last visited the page, make the "Last update: X Days Ago" text green
  var lastUpdateStored = localStorage.getItem('lastUpdateDate');
  if (lastUpdateStored === null || lastUpdateDateStr !== lastUpdateStored) {
    get('lastUpdate').classList.add('green');
  }
  localStorage.setItem('lastUpdateDate', lastUpdateDateStr);
}

// To reduce lag and clutter during development, I create new lessons on a "drawing board" html document with an element named "drawingBoard". If the drawingBoard element is detected, it disables all this stuff to prevent the script from erroring
if (!elementsExist('drawingBoard')) {
  var footer = get('footer');
  var lastUpdateFooter = Date.now();
  var currentUnit = null;

  // Get all unit elements
  var unitElements = document.getElementsByClassName('unit');
  var unitElementIDs = [];
  for (var element of unitElements) {
    unitElementIDs.push(element.id);
  }

  // Get all sections within units
  var unitSections = {}
  for (var id of unitElementIDs) {
    unitSections[id] = getSectionsInUnit(id.replace(/Unit$/, ''));
  }

  // Hide elements that are shown by default
  for (var elementID of hiddenElements) {
    if (elementID in customTextButtons) {
      var showText = customTextButtons[elementID]['showText'];
    }
    else {
      var showText = 'Show';
    }
    var element = get(elementID);
    if (element !== null && element.tagName === 'DIV' && !element.classList.contains('unit') && !element.classList.contains('no-permanent-hide')) {
      hideElement(elementID, null, showText, false);
    }
    else {
      // Element stored in hiddenElements isn't something that's supposed to be hidden
      badElements.push(elementID);
    }
  }

  for (var elementID of badElements) {
    removeFromArray(hiddenElements, elementID);
  }

  // Show elements that are hidden by default
  var shownUnits = [];
  // Units to Mathjax typeset immediately on page load
  var unitsToTypeset = [];
  for (var elementID of shownElements) {
    if (elementID in customTextButtons) {
      var hideText = customTextButtons[elementID]['hideText'];
    }
    else {
      var hideText = 'Hide';
    }

    if (!get(elementID).classList.contains('no-permanent-show')) {
      if (unitElementIDs.includes(elementID + 'Unit')) {
        shownUnits.push(elementID);
      }
      else {
        showElement(elementID, null, hideText, false);
      }
    }
  }

  for (var unitElementID of shownUnits) {
    if (shownUnits.indexOf(unitElementID) >= shownUnits.length - 3) {
      // Only show last 3 units that were shown
      showUnit(unitElementID);
      unitsToTypeset.push(unitElementID);
    }
    else {
      hideElement(unitElementID, null, 'Show', false);
    }
  }

  saveHiddenElements();
  saveShownElements();

  document.addEventListener('scroll', updateFooter);
  document.addEventListener('keydown', keyboardShortcut);

  // Settings
  if (localStorage.getItem('darkMode') === 'true') {
    toggleDarkMode();
  }
  if (localStorage.getItem('graphsInverted') === 'true') {
    invertGraphs();
  }
  if (localStorage.getItem('largeNumFormat') !== null) {
    largeNumFormat = localStorage.getItem('largeNumFormat');
    get('largeNumFormat').value = largeNumFormat;
  }

  for (var element of getClassElements('hidden-until-load')) {
    showElement(element.id);
  }
}

updateSliders();

function loadMathjax() {
  var mathjaxScript = document.createElement('script');
  mathjaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  document.getElementsByTagName('head')[0].appendChild(mathjaxScript);
}

setTimeout(loadMathjax);

get('loading').innerText = 'Loading scripts (2/3)... Some features will not work properly until loading finishes.';