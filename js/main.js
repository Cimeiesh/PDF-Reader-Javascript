const url = '../docs/LifetimeChristmasMovies.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 0.95
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// ============ Render the page ============
const renderPage = num => {
    pageIsRendering = true;

    //============ Get Page ============
    pdfDoc.getPage(num).then(page =>{
        
        //============ Scale The PDF ============
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderCtx).promise.then(() =>{
            pageIsRendering = false;

            if(pageNumIsPending !== null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        //============ Output current Page ============
        document.querySelector('#page-num').textContent = num;
    });
};

//============ Check for pages rendering ============
const queueRenderPage = num =>{
    if(pageIsRendering) {
        pageNumIsPending = num;
    }
    else{
        renderPage(num);
    }
}

//============ Show Prev Page ============ 
const showPrevPage = () => {
    if(pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

//============ Show next Page ============ 
const showNextPage = () => {
    if(pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}


//============ Get Document ============
pdfjsLib.getDocument(url).promise.then(pdfDoc_ =>{
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    
    renderPage(pageNum) 
})
    .catch(err =>{
        //============ ERROR handeling ============
        const div = document.createElement('div');
        div.className = 'error';
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('body').insertBefore(div, canvas);
        
        //============ Remover top bar ============
        document.querySelector('.top-bar').style.display = 'none';
        document.querySelector('.bottom-bar').style.display = 'none';

    });

//============ Button Events ============

document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);

//============ Arrow Events ============
document.body.addEventListener('keydown', function(event)
{
    const key = event.key;
    switch (key) {
        case "ArrowLeft":
            document.getElementById("prev-page").click();
            break;
        case "ArrowRight":
            document.getElementById("next-page").click();
            break;
    }
});

