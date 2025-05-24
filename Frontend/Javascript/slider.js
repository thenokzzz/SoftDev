let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const slider = document.getElementById('slider');

function showSlide(index) {
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  currentIndex = index;
  slider.style.transform = `translateX(-${index * 100}%)`;
}

function nextSlide() {
  showSlide(currentIndex + 1);
}

function prevSlide() {
  showSlide(currentIndex - 1);
}

// Auto-slide setiap 4 detik
setInterval(() => {
  nextSlide();
}, 4000);

// Tampilkan slide pertama saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  showSlide(0);
});
