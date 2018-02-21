/*
reference: http://perfectionkills.com/exploring-canvas-drawing-techniques/
*/
var Shodo = (function(Shodo){
  
  var img = new Image();
  img.src = './image/brush.png';
  let FOOT_PRINT_A = 0.5; // 0.8
  let FOOT_PRINT_B = 0.87; //1.4
  let IMAGE_ORIENTATION = Math.PI/4;

  Shodo.Brush = function(canvas){

    var instance = this;
    var isDrawing, lastPoint, hasFirstDraw;

    this.width = 50; // 線幅
    this.blur = 4; // かすれ
    this.tipAngle = Math.PI / 180 * 40; // 筆先向き 

    this.onMouseDown = function(pointer){
      isDrawing = true;
      hasFirstDraw = false;
      lastPoint = pointer;
      this.onMouseMove({
        x: lastPoint.x + Math.sin(IMAGE_ORIENTATION),
        y:lastPoint.y - Math.cos(IMAGE_ORIENTATION)
      });
    };

    this.onMouseMove = function(pointer){
      if (!isDrawing) return;
      
      var currentPoint = pointer;
      var dist = distanceBetween(lastPoint, currentPoint);
      var angle = angleBetween(lastPoint, currentPoint);
      
      var modSizeRatio = (Math.abs(
        Math.sin(instance.tipAngle - angle)) * (FOOT_PRINT_B - FOOT_PRINT_A) + FOOT_PRINT_A );
      var modSizeRatio2 = Math.min(
        Math.abs(FOOT_PRINT_A/ Math.sin(instance.tipAngle - angle)), 
        FOOT_PRINT_B);

      var modSize = instance.width / modSizeRatio;
      var modBlur = instance.blur * modSizeRatio2 ;
      for (var i = 0; i < dist/modBlur; i++) {
        if(hasFirstDraw && dist/modBlur - i< 1 ){
          if(Math.random() > dist/modBlur - i){
            break;
          }
        }
        hasFirstDraw = true;
        x = lastPoint.x + (Math.cos(angle) * i * modBlur) - 5;
        y = lastPoint.y + (Math.sin(angle) * i * modBlur) - 10;
        //canvas.ctx.drawImage(img, x, y, instance.width, instance.width);
        rotateAndPaintImage(canvas.ctx, img, instance.tipAngle - IMAGE_ORIENTATION,
           x, y, modSize, modSize);
      }
      
      lastPoint = currentPoint;
    };

    this.onMouseUp = function(){
    
      isDrawing = false;
    };

    canvas.el.onmousedown = function(e) {
      pointer = canvas.getPointer(e);
      instance.onMouseDown(pointer);
      e.preventDefault();
    };

    canvas.el.ontouchstart = function(e) {
      pointer = canvas.getPointer(e);
      instance.onMouseDown(pointer);
      e.preventDefault();
    };

    canvas.el.onmousemove = function(e) {
      pointer = canvas.getPointer(e);
      instance.onMouseMove(pointer);
      e.preventDefault();
    };

    canvas.el.ontouchmove = function(e) {
      pointer = canvas.getPointer(e);
      instance.onMouseMove(pointer);
      e.preventDefault();
    };

    canvas.el.onmouseup = function() {
      instance.onMouseUp();
    };

    canvas.el.ontouchend = function() {
      instance.onMouseUp();
    };

    canvas.el.onmouseleave = function() {
      instance.onMouseUp();

    };

    canvas.el.ontouchleave = function() {
      instance.onMouseUp();

    };
  };

 
  Shodo.Canvas = function(id){
    
    this.el = document.getElementById(id);
    this.el.style.touchAction = "none";
    this.el.style.userSelect = "none";
    this.el.style.cursor = "crosshair";
    this.ctx = this.el.getContext('2d');
    this.ctx.lineJoin = this.ctx.lineCap = 'round';

    let elementOffset = getElementOffset(this.el);

    this.clear = function(){
      this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    };

    this.getPointer = function(event) {
      
      if(event.type.match(/touch/i)){
        event = event.touches[0];
      }

      var element = event.target ||
                  (typeof event.srcElement !== unknown ? event.srcElement : null),

      scroll = getScrollLeftTop(element);

      return {
        x: pointerX(event) + scroll.left - elementOffset.left,
        y: pointerY(event) + scroll.top - elementOffset.top
      };
    };

  };

  function distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }
  function angleBetween(point1, point2) {
    return Math.atan2( point2.y - point1.y, point2.x - point1.x);
  }

  var pointerX = function(event) {
    return event.pageX;
    //return event.clientX;
  };

  var pointerY = function(event) {
    return event.pageY;
    //return event.clientY;
  };

  /*
    from http://fabricjs.com/
  */

   /**
   * Returns offset for a given element
   * @function
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to get offset for
   * @return {Object} Object with "left" and "top" properties
   */
  function getElementOffset(element) {
    var docElem,
        doc = element && element.ownerDocument,
        box = { left: 0, top: 0 },
        offset = { left: 0, top: 0 },
        scrollLeftTop,
        offsetAttributes = {
          borderLeftWidth: 'left',
          borderTopWidth:  'top',
          paddingLeft:     'left',
          paddingTop:      'top'
        };

    if (!doc) {
      return offset;
    }

    for (var attr in offsetAttributes) {
      offset[offsetAttributes[attr]] += parseInt(getElementStyle(element, attr), 10) || 0;
    }

    docElem = doc.documentElement;
    if ( typeof element.getBoundingClientRect !== 'undefined' ) {
      box = element.getBoundingClientRect();
    }

    scrollLeftTop = getScrollLeftTop(element);

    return {
      left: box.left + scrollLeftTop.left - (docElem.clientLeft || 0) + offset.left,
      top: box.top + scrollLeftTop.top - (docElem.clientTop || 0)  + offset.top
    };
  }

   /**
   * Returns style attribute value of a given element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to get style attribute for
   * @param {String} attr Style attribute to get for element
   * @return {String} Style attribute value of the given element.
   */
  
  function getElementStyle(element, attr) {
    var value = element.style[attr];
    if (!value && element.currentStyle) {
      value = element.currentStyle[attr];
    }
    return value;
  }

 
  /**
   * Returns element scroll offsets
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to operate on
   * @return {Object} Object with left/top values
   */
  function getScrollLeftTop(element) {

    var left = 0,
        top = 0,
        docElement = document,
        body = document.body || {
          scrollLeft: 0, scrollTop: 0
        };

    // While loop checks (and then sets element to) .parentNode OR .host
    //  to account for ShadowDOM. We still want to traverse up out of ShadowDOM,
    //  but the .parentNode of a root ShadowDOM node will always be null, instead
    //  it should be accessed through .host. See http://stackoverflow.com/a/24765528/4383938
    while (element && (element.parentNode || element.host)) {

      // Set element to element parent, or 'host' in case of ShadowDOM
      element = element.parentNode || element.host;

      if (element === document) {
        left = body.scrollLeft || docElement.scrollLeft || 0;
        top = body.scrollTop ||  docElement.scrollTop || 0;
      }
      else {
        left += element.scrollLeft || 0;
        top += element.scrollTop || 0;
      }

      if (element.nodeType === 1 && element.style.position === 'fixed') {
        break;
      }
    }

    return { left: left, top: top };
  }

  function rotateAndPaintImage ( ctx, image, angle , positionX, positionY, width, height ) {
    ctx.save();
    ctx.translate(positionX, positionY);
    ctx.rotate(angle);
    ctx.translate(-width/2,-height/2);
    ctx.drawImage(image,0,0, width, height);
    ctx.restore();
  }


  return Shodo;


})(Shodo || {});

// based on http://www.tricedesigns.com/2012/01/04/sketching-with-html5-canvas-and-brush-images/




