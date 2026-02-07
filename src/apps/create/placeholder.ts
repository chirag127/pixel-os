export default function render(container: HTMLElement) {
  container.innerHTML = `
    <div style="padding: var(--spacing-xl); text-align: center;">
      <h1> Coming Soon</h1>
      <p>This tool is under development.</p>
      <a href="#/" class="btn btn-primary" style="margin-top: var(--spacing-md);"> Back to Home</a>
    </div>
  `;
}