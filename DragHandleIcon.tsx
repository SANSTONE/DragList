import React from 'react';
import { View } from '@ray-js/components';
import './styles.less';

interface DragHandleIconProps {
  color?: string;
  width?: number;
  height?: number;
}

/**
 * 拖拽手柄图标组件
 * 提供视觉提示，表示可以长按并拖拽
 */
const DragHandleIcon: React.FC<DragHandleIconProps> = ({
  color = '#cccccc',
  width = 24,
  height = 24
}) => {
  return (
    <View className="drag-handle-icon" style={{ width, height }}>
      <View className="drag-handle-line" style={{ backgroundColor: color }} />
      <View className="drag-handle-line" style={{ backgroundColor: color }} />
      <View className="drag-handle-line" style={{ backgroundColor: color }} />
    </View>
  );
};

export default DragHandleIcon; 