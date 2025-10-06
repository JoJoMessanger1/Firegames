export function startNotes(container, onClose) {
  container.innerHTML = '';

  const textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '90%',
    height: '70%',
    margin: '20px auto',
    display: 'block',
    fontSize: '16px',
    padding: '10px',
  });
  textarea.placeholder = 'Schreibe hier deine Notizen...';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Speichern';
  Object.assign(saveBtn.style, {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Schließen';
  Object.assign(closeBtn.style, {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
  });

  saveBtn.addEventListener('click', () => {
    localStorage.setItem('gameNotes', textarea.value);
    alert('Notizen gespeichert!');
  });

  closeBtn.addEventListener('click', () => {
    onClose();
  });

  // Lade gespeicherte Notizen
  const saved = localStorage.getItem('gameNotes');
  if (saved) textarea.value = saved;

  container.appendChild(textarea);
  container.appendChild(saveBtn);
  container.appendChild(closeBtn);
}
