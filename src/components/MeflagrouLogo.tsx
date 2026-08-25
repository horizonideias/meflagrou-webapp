import React from 'react';

interface MeflagrouLogoProps {
  className?: string;
  height?: number | string;
  animated?: boolean;
}

export const MeflagrouLogo: React.FC<MeflagrouLogoProps> = ({
  className = '',
  height = 38,
  animated = true,
}) => {
  return (
    <div 
      className={`meflagrou-official-logo-wrap ${animated ? 'is-focusing' : ''} ${className}`}
      style={{ height, aspectRatio: '1024 / 237' }}
    >
      {/* 1. Base Estática Oficial Original (Texto 'meflagr' + Contorno do Olho + 'u') */}
      <img
        src="/logo-static-base.png"
        alt="meflagrou"
        className="meflagrou-static-base-img"
      />

      {/* 2. Anel Externo do Ícone (Diafragma/Abertura) Rotacionando para um Lado e para o Outro */}
      <img
        src="/logo-aperture-ring.png"
        alt=""
        aria-hidden="true"
        className="meflagrou-aperture-focus-ring"
      />

      {/* 3. Bolinha de Dentro (Íris/Pupila do Olho) Girando para Direita e para Esquerda */}
      <img
        src="/logo-inner-ball.png"
        alt=""
        aria-hidden="true"
        className="meflagrou-inner-pupil-ball"
      />
    </div>
  );
};
