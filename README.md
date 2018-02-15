# Shodo.js

#### Japanese traditional writing brush ####
# [![Shodo.js Capture](https://raw.githubusercontent.com/moritanian/shodo.js/gh-pages/screenshot/sample1.png)](https://moritanian.github.io/shodo.js/)

#### Usage
``` 
<script src='path/to/shodo.js'></script>
<canvas id="canvas" width=500 height="600"></canvas>
<script type="text/javascript"> 
  let canvas  = new Shodo.Canvas('canvas');
  let brush = new Shodo.Brush(canvas);
  brush.width = 20;
  brush.blur = 10;
  brush.tipAngle = Math.PI/4.0;
</script>
```
