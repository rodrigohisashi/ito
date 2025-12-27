import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RoomCode({ code }) {
  const [copied, setCopied] = useState(false);

  // Use /entrar/:code for the shareable link
  const shareUrl = `${window.location.origin}/entrar/${code}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareRoom = async () => {
    const shareData = {
      title: 'ITO - Jogo de Cartas',
      text: `Entre na minha sala de ITO!`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Code display */}
      <motion.div
        className="glass-strong rounded-2xl px-8 py-5 cursor-pointer relative overflow-hidden border-glow"
        whileTap={{ scale: 0.95 }}
        onClick={copyCode}
      >
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gold/40" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gold/40" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gold/40" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gold/40" />

        <p className="text-xs text-gold/60 text-center mb-2 tracking-widest uppercase">Codigo da Sala</p>
        <p className="text-4xl font-display font-bold tracking-[0.3em] text-gradient">{code}</p>
      </motion.div>

      {/* Copy feedback */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : -10 }}
        className="text-gold-light text-sm"
      >
        Copiado!
      </motion.p>

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={copyLink}
          className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-ivory/70 hover:text-gold hover:border-gold/30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Copiar Link
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={shareRoom}
          className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-ivory/70 hover:text-gold hover:border-gold/30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Compartilhar
        </motion.button>
      </div>

      {/* Hint */}
      <p className="text-ivory/30 text-xs text-center">
        Toque no codigo para copiar
      </p>
    </div>
  );
}
