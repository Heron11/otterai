import { AnimatePresence, cubicBezier, motion } from 'framer-motion';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export function SendButton({ show, isStreaming, onClick }: SendButtonProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className="absolute flex justify-center items-center top-[18px] right-[18px] bg-[#e86b47] hover:bg-[#d45a36] text-white rounded-full w-[42px] h-[42px] transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={(event) => {
            event.preventDefault();
            onClick?.(event);
          }}
        >
          {!isStreaming ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          ) : (
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>
          )}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
