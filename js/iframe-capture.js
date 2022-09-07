

export function renderPageAsImage() {
  console.log(`Rendering page as image. ${window.location}`);

  const el = document.getElementById('content');
  htmlToImage.toPng(el)
    .then((dataUrl) => {
      window.parent.postMessage(dataUrl, '*');
    })
    .catch((error) => {
      console.error('There was a problem turning the HTML content into a PNG image.', error);
    });
}
