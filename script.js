// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.onclick = e => {
        e.preventDefault();
        document.querySelector(link.getAttribute('href'))
            .scrollIntoView({ behavior: 'smooth' });
    };
});

// Scroll animations
const observer = new IntersectionObserver(entries => {
    entries.forEach(item => {
        if (item.isIntersecting) {
            item.target.classList.add('appear', 'animated');
        }
    });
});

document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right')
    .forEach(el => observer.observe(el));

// Form submission
const form = document.querySelector('form');

if (form) {
    form.onsubmit = e => {
        e.preventDefault();
        alert('Message sent!');
        form.reset();
    };
}