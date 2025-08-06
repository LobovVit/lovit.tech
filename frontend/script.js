// 1. Тема
const themeBtn = document.getElementById('theme-toggle');
(function initTheme(){
    const saved = localStorage.getItem('theme');
    if (saved) document.body.dataset.theme = saved;
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.body.dataset.theme = 'dark';
    themeBtn.addEventListener('click', ()=>{
        const next = document.body.dataset.theme==='light'?'dark':'light';
        document.body.dataset.theme = next;
        localStorage.setItem('theme', next);
    });
})();

// 2. Появление плиток сразу с небольшой задержкой
const tiles = document.querySelectorAll('.tile');
tiles.forEach((tile, idx) => {
    setTimeout(() => tile.classList.add('visible'), idx * 100);
});

// 3. Скролл к секциям
tiles.forEach(tile=>{
    tile.addEventListener('click', ()=>{
        const id = tile.dataset.target;
        document.getElementById(id).scrollIntoView({behavior:'smooth'});
    });
});

// 4. Анимация появления контент-блоков при скролле
const blocks = document.querySelectorAll('.section-block');
const obsBlocks = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.2 });
blocks.forEach(b => obsBlocks.observe(b));