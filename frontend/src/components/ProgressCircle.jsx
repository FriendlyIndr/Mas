import React from 'react'

const ProgressCircle = ({ percent = 0, size = 36, stroke = 4 }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size}>
        {/* Background */}
        <circle 
            stroke='#e5e7eb'
            fill='transparent'
            strokeWidth={stroke}
            r={radius}
            cx={size / 2}
            cy={size / 2}
        />

        {/* Progress */}
        <circle 
            stroke='#2563eb'
            fill='transparent'
            strokeWidth={stroke}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Text */}
        <text
            x='50%'
            y='50%'
            dy={'0.07rem'}
            dominantBaseline='middle'
            textAnchor='middle'
            fontSize={13}
            fontWeight={'bold'}
        >
            {percent}
        </text>
    </svg>
  )
}

export default ProgressCircle