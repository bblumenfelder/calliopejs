# CalliopeJS - Latin Hexameter Scanner

CalliopeJS is a prosody scanner for dactylic hexameters. It accepts a verse line as input and returns the following informations:

```
{
"scanned": ...       // Scanned verse with macrons and breves ,
"macronized": ...    // Scanned verse only with macrons,
"scansion": ...      // Scansion of the meter (only macrons and breves with spaces of letters in between)
"original":          // The given text string,
"working_line":      // Given verse with elisions and substitutions of half-vowels (i => j)
"scansion_strict":   // Scansion of the meter without spaces
}
```

## Use

Include `calliope.js` in your HTML:

```html
<script src="../calliope.js"></script>
```

Instantiate the class with your input string as constructor and use the `analyze`-method to get results:

```javascript
const calliope = new Calliope(input);
const Analysis = calliope.analyze();
```

## Develop

Feel free to pull and share. The code has been transpiled with **Webpack**.

####:TODO:

- Implement scansion formatter (`UU-UU-UU---UU-- to -UU|-UU|-UU|--|-UU|--`)
- Implement feedback if hexameter is valid or invalid

## Credits

The underlying scansion-method (scansion.js) was written by Dylan Holmes (http://www.logical.ai/arma/) under the GNU GPL 3.0+-licence.
