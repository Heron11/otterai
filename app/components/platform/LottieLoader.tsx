import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieLoaderProps {
	className?: string;
	src: string;
	speed?: number;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({ 
	className = "", 
	src, 
	speed = 0.75 
}) => {
	return (
		<div className={`flex items-center justify-center ${className}`}>
			<DotLottieReact
				src={src}
				loop
				autoplay
				speed={speed}
				style={{ 
					width: 'auto',
					height: 'auto',
					maxWidth: '100%',
					maxHeight: '100%'
				}}
			/>
		</div>
	);
};

// Pre-configured components for specific animations
export const BuildAnimationLoader: React.FC<{ className?: string }> = ({ className }) => (
	<LottieLoader 
		className={className}
		src="https://lottie.host/5f2819f9-aca2-4046-90a3-3be4c0f53a8f/pvwL3dx4Vt.lottie"
		speed={0.75}
	/>
);

export const DeployAnimationLoader: React.FC<{ className?: string }> = ({ className }) => (
	<div className={`flex items-center justify-center ${className}`}>
		<img 
			src="/deployinstantlycard.svg" 
			alt="Deploy animation"
			className="w-full h-full object-contain"
		/>
	</div>
);
