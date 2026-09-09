export async function streamText(
  text: string,
  onUpdate: (partial: string) => void
) {
  let current = '';

  const words = text.split(' ');

  for (let i = 0; i < words.length; i++) {
    current += (i === 0 ? '' : ' ') + words[i];

    onUpdate(current);

    await new Promise((res) =>
      setTimeout(res, 20 + Math.random() * 40)
    );
  }
}