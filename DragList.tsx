import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text } from '@ray-js/components';
import './styles.less';

// 定义组件接口
export interface DragItem {
  id: number;
  [key: string]: any;
}

export interface DragListProps {
  data: DragItem[];
  renderItem: (
    item: DragItem,
    index: number,
    isDragging: boolean,
    dragHandleProps: {
      onTouchStart?: (e: any) => void;
      onClick?: (e: any) => void;
    }
  ) => React.ReactNode;
  onReorder: (newData: DragItem[]) => void;
  itemHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  dragHandleClassName?: string;
  animationDuration?: number;
  vibrateOnChange?: boolean;
}

/**
 * 可拖拽排序列表组件
 * 基于Ray.js环境优化，支持触摸拖拽排序
 */
const DragList: React.FC<DragListProps> = ({
  data,
  renderItem,
  onReorder,
  itemHeight = 60,
  className = '',
  style = {},
  dragHandleClassName = 'drag-handle',
  animationDuration = 150, // 默认动画时间
  vibrateOnChange = true, // 拖拽变化时是否震动
}) => {
  // 状态管理
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [reorderedData, setReorderedData] = useState<DragItem[]>([...data]);
  const [dragCount, setDragCount] = useState(0);
  
  // 添加一个状态用于存储每个项目的偏移量，用于动画
  const [itemOffsets, setItemOffsets] = useState<number[]>([]);

  // 存储每个项目的位置信息
  const [itemPositions, setItemPositions] = useState<Array<{ top: number, height: number }>>([]);

  // 引用管理
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  // 使用ref来存储完成拖拽的函数，避免循环依赖
  const finishDraggingRef = useRef<() => void>(() => {});

  // 数据变化时更新内部状态
  useEffect(() => {
    setReorderedData([...data]);
    // 重置引用数组大小以匹配数据长度
    itemRefs.current = Array(data.length).fill(null);
    // 初始化偏移量数组
    setItemOffsets(new Array(data.length).fill(0));
  }, [data]);

  // 在组件挂载和更新后计算位置
  useEffect(() => {
    // 等待渲染完成后再计算位置
    const timer = setTimeout(() => {
      updateItemPositions();
    }, 100);

    return () => clearTimeout(timer);
  }, [reorderedData]);

  // 重置拖拽状态
  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDraggedIndex(null);
    setDraggedItem(null);
  }, []);

  // 更新所有项目的位置信息
  const updateItemPositions = useCallback(() => {
    const positions = itemRefs.current.map((ref, index) => {
      if (!ref) {
        return { top: index * itemHeight, height: itemHeight };
      }

      try {
        // 减少DOM访问，优先使用offsetTop/offsetHeight
        let top = ref.offsetTop || index * itemHeight;
        let height = ref.offsetHeight || itemHeight;
        return { top, height };
      } catch (error) {
        return { top: index * itemHeight, height: itemHeight };
      }
    });

    // 使用函数式更新，避免依赖过期状态
    setItemPositions(positions);
    return positions;
  }, [itemHeight]);

  // 震动反馈
  const vibrateShort = useCallback(() => {
    if (!vibrateOnChange) return;
    
    // 检查是否在Ray.js环境中，并且vibrateShort可用
    // @ts-ignore - Ray.js类型可能未定义，使用ts-ignore避免类型错误
    if (typeof window !== 'undefined' && window.ty && typeof window.ty.vibrateShort === 'function') {
      try {
        // @ts-ignore - 忽略类型检查
        window.ty.vibrateShort({ type: 'heavy' });
      } catch (error) {
        console.log('振动功能不可用');
      }
    }
  }, [vibrateOnChange]);

  // 拖拽位置更新函数 - 重新实现，实时更新其他项目位置
  const updateDragPosition = useCallback((pageY: number) => {
    if (draggedIndex === null) return;

    // 更新当前Y位置
    setCurrentY(pageY);
    
    // 计算拖拽偏移量
    const offsetY = pageY - dragStartY;

    // 复用现有位置信息
    let positions = itemPositions;
    
    // 如果没有位置信息，使用索引和固定高度计算
    if (positions.length === 0) {
      positions = reorderedData.map((_, i) => ({
        top: i * itemHeight,
        height: itemHeight
      }));
    }

    // 获取拖拽项的原始位置信息
    const draggedPosition = positions[draggedIndex] || { top: draggedIndex * itemHeight, height: itemHeight };
    
    // 计算拖拽项的当前中心位置
    const draggedTop = draggedPosition.top + offsetY;
    const draggedCenter = draggedTop + draggedPosition.height / 2;
    
    // 计算每个项目的新偏移量
    const newOffsets = [...itemOffsets];
    
    // 计算项目的目标位置（如果拖拽完成后应该在的位置）
    let targetIndex = 0;
    
    // 找出拖拽项当前应该在的位置索引
    for (let i = 0; i < positions.length; i++) {
      if (i === draggedIndex) continue;
      
      const itemPosition = positions[i];
      if (!itemPosition) continue;
      
      const itemCenter = itemPosition.top + itemPosition.height / 2;
      
      if (draggedCenter > itemCenter) {
        targetIndex++;
      }
    }
    
    // 如果目标位置与当前位置不同，需要更新其他项目的偏移量
    if (targetIndex !== draggedIndex) {
      // 提供振动反馈，但只在目标位置变化时
      const currentTargetIndex = reorderedData.findIndex(item => item.id === reorderedData[draggedIndex].id);
      if (currentTargetIndex !== targetIndex) {
        vibrateShort();
      }
      
      // 更新所有项目的偏移量
      reorderedData.forEach((item, index) => {
        if (index === draggedIndex) {
          // 拖拽项保持原来的样式，由transform控制
          newOffsets[index] = 0;
        } else {
          // 根据拖拽方向和目标位置计算其他项目的偏移量
          if (draggedIndex < targetIndex) { // 向下拖
            if (index > draggedIndex && index <= targetIndex) {
              // 中间项向上移动一个位置
              newOffsets[index] = -itemHeight;
            } else {
              // 其他项保持原位
              newOffsets[index] = 0;
            }
          } else { // 向上拖
            if (index >= targetIndex && index < draggedIndex) {
              // 中间项向下移动一个位置
              newOffsets[index] = itemHeight;
            } else {
              // 其他项保持原位
              newOffsets[index] = 0;
            }
          }
        }
      });
      
      // 更新偏移量状态
      setItemOffsets(newOffsets);
    }
  }, [draggedIndex, dragStartY, itemHeight, reorderedData, itemPositions, itemOffsets, vibrateShort]);

  // 完成拖拽并应用更改
  const finishDragging = useCallback(() => {
    if (!isDragging || draggedIndex === null) return;

    // 通过当前的偏移量计算新的顺序
    const newOrderedData = [...reorderedData];
    let targetIndex = draggedIndex;
    
    // 根据当前偏移量找出目标位置
    for (let i = 0; i < reorderedData.length; i++) {
      if (i === draggedIndex) continue;
      
      if ((draggedIndex < i && itemOffsets[i] < 0) || 
          (draggedIndex > i && itemOffsets[i] > 0)) {
        // 如果项目有偏移量，说明拖拽项应该插入到这个位置
        targetIndex = i;
        break;
      }
    }
    
    // 如果目标位置与当前位置不同，重新排序数据
    if (targetIndex !== draggedIndex) {
      // 从数组中移除拖拽项
      const [draggedItem] = newOrderedData.splice(draggedIndex, 1);
      // 在新位置插入拖拽项
      newOrderedData.splice(targetIndex, 0, draggedItem);
    }
    
    // 重置所有项目的偏移量
    setItemOffsets(new Array(reorderedData.length).fill(0));
    
    // 更新拖拽计数
    setDragCount(prevCount => prevCount + 1);
    
    // 如果顺序有变化，触发回调
    if (targetIndex !== draggedIndex) {
      onReorder(newOrderedData);
    }
    
    // 更新数据状态(即使顺序没变，也更新以保持一致性)
    setReorderedData(newOrderedData);
    
    // 重置拖拽状态
    resetDragState();
  }, [isDragging, draggedIndex, reorderedData, itemOffsets, onReorder, resetDragState]);

  // 更新ref值以避免循环依赖
  useEffect(() => {
    finishDraggingRef.current = finishDragging;
  }, [finishDragging]);

  // 触摸移动处理 - 优化响应速度
  const handleTouchMove = useCallback((e: any) => {
    if (!isDragging || draggedIndex === null) {
      return;
    }

    // 尝试阻止默认行为
    try {
      e.stopPropagation();
      e.preventDefault();
    } catch (error) {
      // 忽略错误
    }

    // 获取触摸位置
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    if (!touch) return;
    
    // 获取Y坐标
    const pageY = touch.pageY;
    
    // 立即更新拖拽位置，不进行节流，确保最高的响应速度
    updateDragPosition(pageY);
  }, [isDragging, draggedIndex, updateDragPosition]);

  // 触摸开始 - 立即触发拖拽，移除长按逻辑
  const handleTouchStart = useCallback((e: any, index: number) => {
    try {
      e.stopPropagation();
    } catch (error) {
      // 忽略错误
    }

    // 立即开始拖拽，不再需要长按触发
    // 可选：提供轻微振动反馈
    vibrateShort();
      
    // 设置拖拽状态
    setIsDragging(true);
    setDraggedIndex(index);
    setDraggedItem(reorderedData[index]);

    // 更新位置信息
    updateItemPositions();

    // 设置拖拽起始位置
    let pageY = 0;
    if (e.touches && e.touches.length > 0) {
      pageY = e.touches[0].pageY;
    } else if (e.pageY) {
      pageY = e.pageY;
    } else {
      // 使用计算位置
      const position = itemPositions[index];
      if (position) {
        pageY = position.top + position.height / 2;
      } else {
        pageY = index * itemHeight + itemHeight / 2;
      }
    }

    setDragStartY(pageY);
    setCurrentY(pageY);
  }, [reorderedData, itemPositions, itemHeight, updateItemPositions, vibrateShort]);

  // 处理触摸结束
  const handleTouchEnd = useCallback((e: any) => {
    // 如果没有进入拖拽状态，直接返回
    if (!isDragging) {
      return;
    }

    try {
      e.stopPropagation();
      e.preventDefault();
    } catch (error) {
      // 忽略错误
    }

    // 结束拖拽
    finishDraggingRef.current();
  }, [isDragging]);

  // 处理点击事件
  const handleClick = useCallback((e: any) => {
    if (isDragging) {
      try {
        e.stopPropagation();
        e.preventDefault();
      } catch (error) {
        // 忽略错误
      }
      // 结束拖拽
      finishDraggingRef.current();
    }
  }, [isDragging]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 不再需要清理定时器
    };
  }, []);

  // 渲染组件 - 优化拖拽项的样式和动画效果
  return (
    <View
      className={`drag-list ${isDragging ? 'is-dragging' : ''} ${className}`}
      style={{ ...style }}
      ref={containerRef}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
    >
      {reorderedData.map((item, index) => (
        <View
          key={item.id}
          className="drag-list-item"
          style={
            isDragging && index === draggedIndex
              ? {
                  transform: `translate3d(0, ${currentY - dragStartY}px, 0)`,
                  transition: 'none',
                  zIndex: 10,
                  opacity: 0.9,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  pointerEvents: 'none',
                }
              : {
                  transform: `translateY(${itemOffsets[index]}px)`,
                  transition: isDragging ? `transform ${animationDuration}ms ease` : 'none',
                  zIndex: isDragging ? 1 : 'auto',
                }
          }
          ref={(el) => {
            if (el !== null) {
              itemRefs.current[index] = el as any;
            }
          }}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {renderItem(item, index, index === draggedIndex && isDragging, {
            onTouchStart: (e: any) => handleTouchStart(e, index),
            onClick: (e: any) => {} // 添加空的onClick处理函数以满足类型要求
          })}
        </View>
      ))}
    </View>
  );
};

export default DragList; 