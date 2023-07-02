var Articles = (function () {
  function load(elementClass) {
    const articles = document.getElementsByClassName(elementClass);
    for (let i = 0; i < articles.length; i++) {
      let article = articles[i];
      let src = article.getAttribute("data-src");
      loadArticle(article, src);
    }
  }

  function loadArticle(element, src) {
    fetch(src)
      .then(function (response) {
        return response.text()
      })
      .then(function (html) {
        element.innerHTML = html;
      })
      .catch(function (err) {
        console.log('Failed to fetch page: ', err);
      });
  }

  return {
    load: load
  }
});