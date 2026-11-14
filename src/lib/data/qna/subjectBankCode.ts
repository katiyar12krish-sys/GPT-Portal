import type { PlacementMcq } from '../placementQnaBank';
import { generate, mcq, numDistractors, type Rng } from './builder';
import { pairs, type Fact } from './pairs';

// Subject Bank, part 1: programming languages and web. Output questions are worked out by code.
const C = 'Subject Bank' as const;
const tag = (subject: string, list: PlacementMcq[]) => list.map(q => ({ ...q, subject }));
const num = (r: Rng, id: string, q: string, a: number, why: string, step?: number) =>
  mcq(r, id, C, q, String(a), numDistractors(r, a, step ?? Math.max(1, Math.round(Math.abs(a) * 0.15))).map(String), why);

/** Integer code output for C-like languages. */
function codeOutput(prefix: string, seed: number, subject: string, type: string, print: (x: string) => string): PlacementMcq[] {
  return tag(subject, generate(prefix, seed, 72, (r, id, i) => {
    const a = r.int(11, 97);
    const b = r.int(2, 9);
    const c = r.int(2, 9);
    switch (i % 6) {
      case 0:
        return num(r, id, `Output? ${type} a = ${a}, b = ${b}; ${print(`a % b * ${c}`)}`, (a % b) * c, `${a} % ${b} = ${a % b}; × ${c} = ${(a % b) * c}`, 2);
      case 1:
        return num(r, id, `Output? ${type} a = ${a}, b = ${b}; ${print(`a / b + ${c}`)}`, Math.trunc(a / b) + c, `Integer division: ${a} / ${b} = ${Math.trunc(a / b)}`, 2);
      case 2:
        return num(r, id, `Output? ${type} x = ${a}; x += ${b}; x *= ${c}; ${print('x')}`, (a + b) * c, `(${a} + ${b}) × ${c}`);
      case 3: {
        const n = r.int(3, 60);
        return num(r, id, `Output? ${type} s = 0; for (${type} i = 1; i <= ${n}; i++) s += i; ${print('s')}`, (n * (n + 1)) / 2, `Sum 1 to ${n} = n(n+1)/2`);
      }
      case 4:
        return num(r, id, `Output? ${type} a = ${a}, b = ${b * c}; ${print('a > b ? a - b : b - a')}`, Math.abs(a - b * c), `The ternary gives the difference`, 3);
      default: {
        let n = r.int(9, 500);
        const start = n;
        let k = 0;
        while (n > 0) {
          n = Math.trunc(n / 2);
          k++;
        }
        return num(r, id, `Output? ${type} n = ${start}, c = 0; while (n > 0) { n = n / 2; c++; } ${print('c')}`, k, `n halves ${k} times before reaching 0`, 1);
      }
    }
  }));
}

const CF: Fact[] = [
  ['printf()', 'Prints formatted output'], ['scanf()', 'Reads formatted input'], ['getchar()', 'Reads one character'], ['putchar()', 'Writes one character'], ['gets() / fgets()', 'Reads a line of text'], ['strlen()', 'Finds the length of a string'], ['strcpy()', 'Copies one string to another'], ['strcat()', 'Joins two strings'], ['strcmp()', 'Compares two strings'], ['malloc()', 'Allocates a block of memory'], ['calloc()', 'Allocates memory and sets it to zero'], ['realloc()', 'Changes the size of allocated memory'], ['free()', 'Releases allocated memory'], ['fopen()', 'Opens a file'], ['fclose()', 'Closes a file'], ['fprintf()', 'Writes formatted data to a file'], ['fgetc()', 'Reads one character from a file'], ['sizeof', 'Gives the size of a type in bytes'], ['break', 'Exits the nearest loop or switch'], ['continue', 'Skips to the next loop iteration'], ['return', 'Exits a function with a value'], ['goto', 'Jumps to a labelled statement'], ['typedef', 'Creates a new name for a type'], ['enum', 'Defines named integer constants'], ['struct', 'Groups different data types under one name'], ['union', 'Shares one memory location among members'], ['static', 'Keeps a local variable alive between calls'], ['extern', 'Declares a variable defined in another file'], ['const', 'Makes a variable read-only'], ['#include', 'Adds a header file'], ['#define', 'Creates a macro'], ['%c', 'Format specifier for a character'], ['%s', 'Format specifier for a string'], ['%f', 'Format specifier for a float'], ['%x', 'Format specifier for hexadecimal'], ['&', 'Address-of operator'], ['*', 'Dereference operator'], ['->', 'Accesses a structure member through a pointer'],
];
const CPPF: Fact[] = [
  ['class', 'Blueprint for creating objects'], ['object', 'An instance of a class'], ['constructor', 'Runs automatically when an object is created'], ['destructor', 'Runs automatically when an object is destroyed'], ['this pointer', 'Points to the current object'], ['encapsulation', 'Binding data and functions together'], ['abstraction', 'Showing only essential details'], ['inheritance', 'Deriving a new class from an existing class'], ['polymorphism', 'One name with many forms'], ['function overloading', 'Same function name with different parameters'], ['function overriding', 'Derived class redefines a base class function'], ['virtual function', 'Resolved at run time through a base pointer'], ['pure virtual function', 'A virtual function declared with = 0'], ['abstract class', 'A class with at least one pure virtual function'], ['friend function', 'Non-member function that can access private members'], ['inline function', 'Compiler may expand the code at the call site'], ['template', 'Writes generic code for many types'], ['namespace', 'Groups names to avoid conflicts'], ['new', 'Allocates memory on the heap'], ['delete', 'Frees memory allocated by new'], ['cout', 'Standard output stream'], ['cin', 'Standard input stream'], ['endl', 'Inserts a new line and flushes the stream'], ['private', 'Accessible only inside the class'], ['public', 'Accessible from anywhere'], ['protected', 'Accessible in the class and derived classes'], ['static member', 'Shared by all objects of a class'], ['reference', 'Another name for an existing variable'], ['try / catch', 'Handles exceptions'], ['throw', 'Raises an exception'], ['std::vector', 'Dynamic array in the STL'], ['std::map', 'Sorted key-value container'], ['std::set', 'Sorted container of unique values'], ['std::string', 'Standard text class'], ['copy constructor', 'Creates an object from another object'], ['scope resolution ::', 'Defines a member outside its class'], ['iostream', 'Header for cin and cout'],
];
const JAVAF: Fact[] = [
  ['JVM', 'Runs Java bytecode'], ['JDK', 'Tools to develop Java programs'], ['JRE', 'Environment to run Java programs'], ['javac', 'Compiles Java source code'], ['.class file', 'Contains Java bytecode'], ['extends', 'Inherits from a class'], ['implements', 'Uses an interface'], ['interface', 'Defines methods a class must provide'], ['abstract class', 'Cannot be instantiated directly'], ['final class', 'Cannot be inherited'], ['final variable', 'Cannot be reassigned'], ['static method', 'Belongs to the class, not an object'], ['super', 'Refers to the parent class'], ['this', 'Refers to the current object'], ['package', 'Groups related classes'], ['import', 'Brings a class into a file'], ['String', 'Immutable sequence of characters'], ['StringBuilder', 'Mutable sequence of characters'], ['ArrayList', 'Resizable array'], ['HashMap', 'Stores key-value pairs'], ['HashSet', 'Stores unique values'], ['LinkedList', 'Stores elements in linked nodes'], ['try-catch', 'Handles exceptions'], ['finally', 'Block that normally always runs after try'], ['throw', 'Raises an exception'], ['throws', 'Declares exceptions a method may raise'], ['Thread', 'A separate path of execution'], ['synchronized', 'Lets one thread use a block at a time'], ['garbage collector', 'Frees unused objects automatically'], ['wrapper class', 'Object form of a primitive type'], ['autoboxing', 'Converts a primitive to its wrapper automatically'], ['main method', 'Entry point of a Java program'], ['byte', 'Primitive type of 8 bits'], ['int', 'Primitive type of 32 bits'], ['long', 'Primitive type of 64 bits'], ['char', 'Primitive type of 16 bits'],
];
const PYF: Fact[] = [
  ['def', 'Defines a function'], ['class', 'Defines a class'], ['lambda', 'Creates a small anonymous function'], ['import', 'Loads a module'], ['pass', 'Does nothing'], ['None', 'Represents no value'], ['list', 'Ordered, changeable collection'], ['tuple', 'Ordered, unchangeable collection'], ['set', 'Unordered collection of unique items'], ['dict', 'Collection of key-value pairs'], ['len()', 'Returns the number of items'], ['range()', 'Produces a sequence of numbers'], ['input()', 'Reads text from the user'], ['print()', 'Displays output'], ['type()', 'Returns the type of an object'], ['int()', 'Converts a value to an integer'], ['str()', 'Converts a value to a string'], ['append()', 'Adds an item to the end of a list'], ['pop()', 'Removes and returns an item'], ['sort()', 'Sorts a list in place'], ['sorted()', 'Returns a new sorted list'], ['split()', 'Breaks a string into a list'], ['join()', 'Combines strings with a separator'], ['strip()', 'Removes spaces from both ends'], ['upper()', 'Converts text to capitals'], ['try / except', 'Handles errors'], ['with open()', 'Opens a file and closes it automatically'], ['self', 'Refers to the current object in a method'], ['__init__', 'Runs when an object is created'], ['pip', 'Installs Python packages'], ['//', 'Floor division operator'], ['**', 'Power operator'], ['yield', 'Makes a generator function'], ['enumerate()', 'Gives index and value while looping'], ['zip()', 'Pairs items from two lists'],
];
const JSF: Fact[] = [
  ['let', 'Declares a block-scoped variable'], ['const', 'Declares a block-scoped constant'], ['var', 'Declares a function-scoped variable'], ['===', 'Checks value and type'], ['==', 'Checks value after type conversion'], ['typeof', 'Returns the type as a string'], ['undefined', 'A variable declared but not assigned'], ['null', 'An intentional empty value'], ['NaN', 'Result of an invalid number operation'], ['document.getElementById()', 'Finds an element by its id'], ['document.querySelector()', 'Finds the first element matching a selector'], ['addEventListener()', 'Attaches an event handler'], ['innerHTML', 'Gets or sets HTML inside an element'], ['textContent', 'Gets or sets plain text of an element'], ['alert()', 'Shows a message box'], ['prompt()', 'Asks the user for input'], ['confirm()', 'Asks the user for OK or Cancel'], ['console.log()', 'Prints to the browser console'], ['setTimeout()', 'Runs code once after a delay'], ['setInterval()', 'Runs code repeatedly'], ['push()', 'Adds an item to the end of an array'], ['pop()', 'Removes the last array item'], ['shift()', 'Removes the first array item'], ['unshift()', 'Adds an item to the start of an array'], ['map()', 'Creates a new array by transforming items'], ['filter()', 'Creates a new array of matching items'], ['reduce()', 'Combines an array into a single value'], ['forEach()', 'Runs a function for each item'], ['JSON.parse()', 'Converts JSON text to an object'], ['JSON.stringify()', 'Converts an object to JSON text'], ['fetch()', 'Makes a network request'], ['async / await', 'Writes promise code in a simple way'], ['Promise', 'Represents a future result'], ['arrow function', 'Short function written with =>'], ['localStorage', 'Stores data in the browser'], ['closure', 'A function that remembers its outer variables'],
];
const HTMLF: Fact[] = [
  ['<html>', 'Root element of a page'], ['<head>', 'Holds page information'], ['<title>', 'Text shown on the browser tab'], ['<body>', 'Holds visible page content'], ['<h1>', 'Largest heading'], ['<h6>', 'Smallest heading'], ['<p>', 'Paragraph'], ['<br>', 'Line break'], ['<hr>', 'Horizontal line'], ['<a>', 'Hyperlink'], ['<img>', 'Image'], ['<ul>', 'Unordered list'], ['<ol>', 'Ordered list'], ['<li>', 'List item'], ['<dl>', 'Description list'], ['<table>', 'Table'], ['<tr>', 'Table row'], ['<td>', 'Table data cell'], ['<th>', 'Table header cell'], ['<thead>', 'Header group of a table'], ['<tbody>', 'Body group of a table'], ['<caption>', 'Title of a table'], ['<form>', 'Collects user input'], ['<input>', 'Single input control'], ['<textarea>', 'Multi-line text box'], ['<select>', 'Drop-down list'], ['<option>', 'One choice in a drop-down'], ['<button>', 'Clickable button'], ['<label>', 'Caption for a form control'], ['<fieldset>', 'Groups related form controls'], ['<div>', 'Generic block container'], ['<span>', 'Generic inline container'], ['<strong>', 'Important text'], ['<em>', 'Emphasised text'], ['<mark>', 'Highlighted text'], ['<sub>', 'Subscript text'], ['<sup>', 'Superscript text'], ['<pre>', 'Preformatted text'], ['<code>', 'Computer code text'], ['<blockquote>', 'Long quotation'], ['<nav>', 'Navigation links section'], ['<header>', 'Introductory section'], ['<footer>', 'Bottom section of a page'], ['<main>', 'Main content of a page'], ['<section>', 'Thematic grouping of content'], ['<article>', 'Self-contained content'], ['<aside>', 'Side content'], ['<audio>', 'Sound player'], ['<video>', 'Video player'], ['<canvas>', 'Drawing area for scripts'], ['<svg>', 'Vector graphics container'], ['<iframe>', 'Embeds another page'], ['<link>', 'Connects an external stylesheet'], ['<meta>', 'Page metadata such as charset'], ['<script>', 'Holds or loads JavaScript'], ['<style>', 'Holds internal CSS'],
];
const HTMLA: Fact[] = [
  ['href', 'Target address of a link'], ['src', 'Path of an image or script'], ['alt', 'Alternative text for an image'], ['target', 'Where a link opens'], ['colspan', 'Cell spans several columns'], ['rowspan', 'Cell spans several rows'], ['placeholder', 'Hint text in an input'], ['required', 'Field must be filled'], ['disabled', 'Control cannot be used'], ['readonly', 'Field cannot be edited'], ['action', 'URL that receives form data'], ['method', 'HTTP method of a form'], ['type="email"', 'Input checks for an email address'], ['type="password"', 'Input hides typed characters'], ['type="radio"', 'Input for one choice from a group'], ['type="checkbox"', 'Input for on or off choice'],
];
const CSSF: Fact[] = [
  ['color', 'Sets text colour'], ['background-color', 'Sets background colour'], ['font-size', 'Sets text size'], ['font-weight', 'Sets text boldness'], ['font-family', 'Sets the typeface'], ['text-align', 'Sets horizontal text alignment'], ['text-decoration', 'Adds or removes underline'], ['line-height', 'Sets space between lines'], ['margin', 'Space outside the border'], ['padding', 'Space inside the border'], ['border', 'Line around an element'], ['border-radius', 'Rounds the corners'], ['box-shadow', 'Adds a shadow to a box'], ['width', 'Sets element width'], ['height', 'Sets element height'], ['display', 'Sets how an element is laid out'], ['position', 'Sets the positioning method'], ['z-index', 'Sets stacking order'], ['overflow', 'Handles content that does not fit'], ['opacity', 'Sets transparency'], ['visibility', 'Shows or hides but keeps space'], ['float', 'Moves an element left or right'], ['clear', 'Stops wrapping around floats'], ['cursor', 'Sets the mouse pointer style'], ['flex-direction', 'Sets the flex main axis'], ['justify-content', 'Aligns items along the main axis'], ['align-items', 'Aligns items across the cross axis'], ['flex-wrap', 'Lets flex items move to a new line'], ['grid-template-columns', 'Defines grid columns'], ['gap', 'Sets space between grid or flex items'], ['transition', 'Animates a property change smoothly'], ['transform', 'Rotates, scales or moves an element'], ['@media', 'Applies styles by screen size'], ['.classname', 'Selects by class'], ['#idname', 'Selects by id'], [':hover', 'Applies when the pointer is over an element'], ['!important', 'Overrides normal rule priority'], ['rem', 'Unit relative to the root font size'], ['em', 'Unit relative to the parent font size'], ['vh', 'Unit relative to viewport height'],
];

export const CODE_SUBJECTS: PlacementMcq[] = [
  ...codeOutput('sb-c', 1001, 'C Programming', 'int', x => `printf("%d", ${x});`),
  ...pairs('sb-cf', 1002, C, 'C Programming', CF, a => `In C, what does ${a} do?`, b => `In C, which one is used here: "${b}"?`),
  ...codeOutput('sb-cpp', 1003, 'C++', 'int', x => `cout << ${x};`),
  ...pairs('sb-cppf', 1004, C, 'C++', CPPF, a => `In C++, what is ${a}?`, b => `In C++, which term means: "${b}"?`),
  ...codeOutput('sb-java', 1005, 'Java', 'int', x => `System.out.println(${x});`),
  ...pairs('sb-javaf', 1006, C, 'Java', JAVAF, a => `In Java, what is ${a}?`, b => `In Java, which term means: "${b}"?`),
  ...tag('Python', generate('sb-py', 1007, 66, (r, id, i) => {
    const a = r.int(11, 97);
    const b = r.int(2, 9);
    const k = r.int(2, 4);
    const words = ['PYTHON', 'DIPLOMA', 'PROGRAM', 'NETWORK', 'STUDENT', 'COMPUTER', 'TANAKPUR'];
    switch (i % 6) {
      case 0:
        return num(r, id, `Output of print(${a} // ${b})?`, Math.floor(a / b), `// is floor division`, 2);
      case 1:
        return num(r, id, `Output of print(${a} % ${b})?`, a % b, `Remainder of ${a} ÷ ${b}`, 1);
      case 2:
        return num(r, id, `Output of print(${b} ** ${k})?`, b ** k, `${b} to the power ${k}`);
      case 3: {
        const s = r.int(1, 4);
        return num(r, id, `Output of print(len(range(0, ${a}, ${s})))?`, Math.ceil(a / s), `Numbers from 0 below ${a} in steps of ${s}`, 2);
      }
      case 4: {
        const w = r.pick(words);
        const x = r.int(0, 2);
        const y = r.int(3, 5);
        const ans = w.slice(x, y);
        return mcq(r, id, C, `Output of print("${w}"[${x}:${y}])?`, ans, [w.slice(x, y + 1), w.slice(x + 1, y), w.slice(x + 1, y + 1)], `Slice runs from index ${x} up to, not including, ${y}`);
      }
      default: {
        const l = [r.int(1, 30), r.int(1, 30), r.int(1, 30), r.int(1, 30)];
        return num(r, id, `Output of print(sum([${l.join(', ')}]))?`, l.reduce((p, q) => p + q, 0), `Adds all list items`);
      }
    }
  })),
  ...pairs('sb-pyf', 1008, C, 'Python', PYF, a => `In Python, what is ${a} used for?`, b => `In Python, which one is used here: "${b}"?`),
  ...tag('JavaScript', generate('sb-js', 1009, 60, (r, id, i) => {
    const a = r.int(11, 97);
    const b = r.int(2, 9);
    switch (i % 5) {
      case 0:
        return num(r, id, `Output of console.log(${a} % ${b})?`, a % b, `Remainder`, 1);
      case 1:
        return mcq(r, id, C, `Output of console.log("${a}" + ${b})?`, `${a}${b}`, [String(a + b), `${a} ${b}`, 'NaN'], `A string plus a number joins as text`);
      case 2:
        return num(r, id, `Output of console.log("${a}" * ${b})?`, a * b, `* converts the string to a number`);
      case 3: {
        const l = [r.int(1, 30), r.int(1, 30), r.int(1, 30), r.int(1, 30), r.int(1, 30)];
        return num(r, id, `Output of console.log([${l.join(', ')}].length + ${b})?`, 5 + b, `The array has 5 items`, 1);
      }
      default: {
        const l = [r.int(1, 40), r.int(1, 40), r.int(1, 40)];
        return num(r, id, `Output of console.log([${l.join(', ')}].reduce((s, x) => s + x, ${b}))?`, l.reduce((p, q) => p + q, b), `Adds all items to the start value ${b}`);
      }
    }
  })),
  ...pairs('sb-jsf', 1010, C, 'JavaScript', JSF, a => `In JavaScript, what is ${a}?`, b => `In JavaScript, which one matches: "${b}"?`),
  ...pairs('sb-html', 1011, C, 'HTML', HTMLF, a => `What is the HTML tag ${a} used for?`, b => `Which HTML tag is used for: ${b}?`),
  ...pairs('sb-htmla', 1012, C, 'HTML', HTMLA, a => `What does the HTML attribute ${a} do?`, b => `Which HTML attribute matches: ${b}?`),
  ...pairs('sb-css', 1013, C, 'CSS', CSSF, a => `What does ${a} do in CSS?`, b => `Which CSS item matches: ${b}?`),
  ...tag('CSS', generate('sb-cssn', 1014, 50, (r, id, i) => {
    const w = r.int(10, 60) * 10;
    const p = r.int(1, 6) * 5;
    const bd = r.int(1, 5);
    const m = r.int(1, 4) * 10;
    if (i % 3 === 0) return num(r, id, `With box-sizing: content-box, width ${w}px, padding ${p}px and border ${bd}px, what is the total width?`, w + 2 * p + 2 * bd, `width + 2 × padding + 2 × border`, 5);
    if (i % 3 === 1) return num(r, id, `Total space taken across: width ${w}px and margin ${m}px on both sides?`, w + 2 * m, `width + 2 × margin`, 10);
    const rem = r.int(2, 9) / 2 + r.int(1, 6) * 2;
    return mcq(r, id, C, `If the root font size is 16px, what is ${rem}rem in px?`, `${rem * 16}px`, [`${rem * 10}px`, `${rem * 12}px`, `${rem * 20}px`], `${rem} × 16`);
  })),
];
