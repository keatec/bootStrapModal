/*

MIT License

Copyright (c) 2017 Keatec GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

(function (exports) {

    var recursion = 0;

    exports.betterModal = {
        run : function (aelement,aoptions) {
            var options = aoptions; if (options ==undefined) options = {};
            return new Promise (function (res,rej) {
                if (aelement.length == 0) rej('Dialog not found');
                recursion++;
                if (recursion > 5) return rej('A Maximum number of 5 Snychronus Dialogs is allowed!');
                var element = aelement.filter('.modal:not(.dialogactive)').clone(true).addClass('dialogactive');
                element.find('.dlg-element').map(function (e,obj) {
                    var tt = $(obj).data('element');
                    if (tt == undefined) return;
                    var te = options[tt];
                    if (te == undefined) {
                        console.log('Dialog! ('+tt+' is undefined)');
                        return;  
                    };
                    if ($.isFunction(te)) {
                        te($(obj));
                    } else {
                        if ($(obj).is('input')) {
                            $(obj).val(''+te);
                        } else {
                            $(obj).text(''+te);
                        }
                    }
                });
/*                for (var i in options) {
                    var el = $(''+i,element);
                    if (el.length > 0) {
                        if ($.isFunction(options[i])) {
                            options[i](el);
                        } else {
                            el.text(options[i]);
                        }
                    };  
                };*/
                element.appendTo($('body'));
                var cancel = true;
                var onOk = function (click) {
                    var modalResult = $(click.target).data('modalresult')
                    if (options.check != undefined) {
                        Promise.try(function () {
                            return options.check(element);
                        }).then(function (answer) {
                            if (answer) {
                                cancel = false;
                                element.modal('hide');
                                element.data('modalresult',modalResult);
                                res(element);
                            } else {
                                $(click.target).one('click',onOk);
                            }
                        }).catch(function (err) {
                            $(click.target).one('click',onOk);
                            console.log(err, 'On Ok check');
                        })
                    } else {
                        cancel = false;
                        element.modal('hide');
                        element.data('modalresult',modalResult);
                        res(element);
                    };
                };
                element.find('.ok').one('click',onOk);
                element.modal().one('hidden.bs.modal',function () {
                    setTimeout(function () {
                        console.log('hide!',cancel);
                        if (cancel) rej('Dialog Cancel');
                        element.remove();
                        console.log('dialog removed')
                        recursion--;
                    },0);
                }).one('shown.bs.modal', function () {
                   element.find('input').first().focus();
                });
            });
        }
    };
})(window);


