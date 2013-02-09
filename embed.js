(function() {
  function next(val, tag, attr) {
    var all, s, i;
    tag = tag || 'script';
    attr = attr || 'src';
    if ('function' === typeof doc.querySelectorAll)
      all = doc.querySelectorAll(tag + '['+ attr +'^="'+ val +'"]');
    else
      all = doc.getElementsByTagName(tag);
    if ('class' === attr) attr = 'className';
    for (i = 0; s = all[i]; i++)
      if (!(s.getAttribute(attr) || '').indexOf(val) &&
          !s.brite && s.parentNode) {
        s.brite = 1;
        return s;
      }
    return null;
  }

  var dim = { 700: 467
            , 620: 413
            , 460: 307
            }
    , pfx = ['', 'webkit', 'moz', 'ms', 'o']
    , doc = document
    , my  = doc.currentScript // Firefox optimization
              || next('embed.js')
              || next('//cache.britely.com/embed.js')
              || next('http://cache.britely.com/embed.js') // compat for older embeds
              || next('http://books.britely.com/embed.js')
    , frg = my.src.split('#')[1]
    , id  = my.getAttribute('data-id') || frg
    , ui  = my.getAttribute('data-ui') == 'bare' ? '&bare=1&nounderbar=1' : ''
    , src = '&src_domain='+ encodeURIComponent(location.host)
    , div = my.previousSibling
    , w   = my.getAttribute('data-width')
    , i   = doc.createElement('iframe')
    , W, H
    ;

  if (div && !div.id) div = div.previousSibling; // Tumblr adds a text node here
  if (div && id && div.id === 'brite-'+ id)
    add(); // benevolent case - not Blogger or other HTML-censoring embedder
  else
    setTimeout(add, 100);

  function add() {
    if (!id) { // Blogger neuters all script attribute values except 'src'
      div = div || next('britely-embed', 'div', 'class');
      id = /^brite-([\da-f]{24})$/.exec(div && div.id || '');
      if (id) id = id[1];
    }

    try { div = div || id && doc.getElementById('brite-'+ id); }
    catch(e) {}
    if (!div || !div.parentNode) {
      setTimeout(add, 100);
      return;
    }
    div.removeAttribute('id'); // no longer needed -- allows multiple embeds

    if (!w) w = parseInt(div.style.width, 10); // old embeds lack data-width
    if (!(+w in dim)) w = 700;
    W = w;
    H = dim[w];
    if (!ui) { // bare ui has a smaller iframe
      H += 92;
    }

//  i.src = "http://cache.britely.com/embed/BOOK_ID?w=WIDTH"
//            .replace(/BOOK_ID/, id).replace(/WIDTH/, w) + ui + src +'#'+ frg;
    i.src = "embed/BOOK_ID-WIDTH.html?w=WIDTH"
              .replace(/BOOK_ID/, id).replace(/WIDTH/g,w) + ui + src +'#'+ frg;
    i.frameBorder = 0; // IE8
    while (pfx.length)
      i.setAttribute(pfx.shift() + 'allowfullscreen', 'true');
    i.style.cssText = div.style.cssText;
    i.className = div.className;
    if (!ui) {
      i.style.boxShadow = '0px 1px 2px #e4e4e4';
      i.style.borderRadius = '8px';
      i.style.borderWidth = '0';
    }
    i.style.height = H + 'px';
    i.style.width = W + 'px';
    div.parentNode.replaceChild(i, div);

    if ('addEventListener' in i)
      i.addEventListener('mouseover', report, false);
    else if ('attachEvent' in i)
      i.attachEvent('onmouseover', report);
    function report() {
      var win = i.contentWindow;
      if (win && win.postMessage)
        win.postMessage('{"embed":"mouseover"}', '*');
    }
  }
})();
