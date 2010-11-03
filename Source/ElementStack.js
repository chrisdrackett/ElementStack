/*
---
script: ElementStacks.js
decription: ElementStacks stacks elements/images on top of each other with a funky transition
license: MIT-style license.
authors:
 - Oskar Krawczyk (http://nouincolor.com/)
 - Chris Drackett (http://chrisdrackett.com/)
requires: 
  core:1.2.3: 
  - Class.Extras
  - Array
  - Function
  - Event
  - Element.Style
  - Element.Dimensions
  - Fx.Morph
  - Fx.Transitions
provides: [ElementStacks]
...
*/

var ElementStacks = new Class({

    Implements: [Options],
    
    options: {
        rotationDeg: 12,
        delay: 30,
        margin: 6,
        duration: 900,
        transition: 'back:out'
    },
    
    initialize: function(selector, wrapper, options){
        this.setOptions(options);
        this.pos, this.collapsed, this.wrapper = wrapper, this.stackItems = selector
        
        this.setDefaults();
        
        this.reStack(this.stackItems, 'in', this.stackItems[$random(0, 8)]);
        this.collapsed = true;
    },
    
    setDefaults: function(){
        this.stackItems.each(function(stackItem){
            this.pos = stackItem.getPosition(this.wrapper);
            
            stackItem.store('default:coords', this.pos);
            stackItem.store('default:size', stackItem.getSize());
            this.default_size = stackItem.getSize();
            
            stackItem.set('morph', {
                transition: this.options.transition,
                duration: this.options.duration
            });
            
            if ($('facts')) {
                $('facts').set('morph', {
                    transition: this.options.transition,
                    duration: this.options.duration
                });
            }
            
        }, this);
        
        this.attachActions();
    },
    
    reStack: function(els, mode, altEl){
        var that = this;
        
        if (mode == 'in') {
            var x_pos = 0;
            var y_pos = 0;
        } else {
            var x_pos = -this.default_size.x;
            var y_pos = -this.default_size.y;
        };
        var count = 1;
        
        if (mode == 'in'){
            altEl.setStyle('z-index', 100);
        } else {
            (function(){
                els.setStyle('z-index', 10);
            }).delay(that.options.delay * els.length);
        }
        
        els.each(function(stackItem, i){
            (function(){
                var el = $pick(altEl, this);
                
                var rand = (mode === 'in' ? $random(-that.options.rotationDeg, that.options.rotationDeg) : 0);
                var scale = (mode === 'in' ? 1 : 0.5);
                
                if (Browser.safari || Browser.chrome) {
                    this.set('styles', {
                        '-webkit-transform': 'scale3d(' + scale + ', ' + scale + ', ' + scale + ') translate3d(' + (x_pos + rand) +'px, ' + (y_pos + rand) +'px, 0px) rotateZ(' + rand + 'deg)'
                    });
                    
                    if ($('facts') && mode == 'in' && this == el) {
                        $('facts').set('styles', {
                            '-webkit-transform': 'translate3d(' + -i * 950 + 'px, 0px, 0px)'
                        });
                    }
                    
                } else {
                    this.set('styles', {
                        '-moz-transform': 'rotate(' + rand + 'deg)'
                    });
                    
                    this.morph({
                        top: y_pos + rand,
                        left: x_pos + rand
                    });
                    
                    if ($('facts') && mode == 'in' && this == el) {
                        $('facts').morph({
                            left: -i * 950
                        });
                    }
                    
                }
                
                if (mode != 'in') {
                    x_pos = x_pos + stackItem.retrieve('default:size').x + that.options.margin;
                    
                    if (count == 3) {
                        count = 0;
                        x_pos = -stackItem.retrieve('default:size').x;
                        y_pos = y_pos + stackItem.retrieve('default:size').y + that.options.margin;
                    }
                    count++
                }
            }).delay(that.options.delay * i, stackItem);
        });
    },

    attachActions: function(){
        this.stackItems.addEvents({
            click: function(e){
                if (this.collapsed){
                    this.reStack(this.stackItems);
                    this.collapsed = false;
                } else {
                    var target = $(e.target);
                    
                    if (target.retrieve('default:coords')){
                       this.reStack(this.stackItems, 'in', target);
                       this.collapsed = true;
                    }
                }
            }.bind(this)
        });
    }
});