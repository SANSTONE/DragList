import React, { useState } from 'react';
import { View, Text } from '@ray-js/components';
import DragList, { DragHandleIcon, DragItem } from './index';
import './styles.less';

interface ExampleItem extends DragItem {
  title: string;
  color: string;
}

/**
 * DragList组件使用示例
 */
const DragListExample: React.FC = () => {
  // 示例数据
  const [items, setItems] = useState<ExampleItem[]>([
    { id: 1, title: '第一项', color: '#f2a5a5' },
    { id: 2, title: '第二项', color: '#a5c8f2' },
    { id: 3, title: '第三项', color: '#a5f2c0' },
    { id: 4, title: '第四项', color: '#e2f2a5' },
    { id: 5, title: '第五项', color: '#d9a5f2' },
  ]);

  // 处理重新排序
  const handleReorder = (newItems: ExampleItem[]) => {
    setItems(newItems);
    console.log('列表已重新排序:', newItems.map(item => item.title));
  };

  return (
    <View style={{ padding: '16px' }}>
      <Text style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 'bold' }}>
        拖拽列表示例 (长按拖动手柄进行排序)
      </Text>
      
      <DragList
        data={items}
        onReorder={handleReorder}
        itemHeight={70}
        renderItem={(item, index, isDragging, dragHandleProps) => (
          <View 
            style={{ 
              backgroundColor: item.color, 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              opacity: isDragging ? 0.8 : 1,
              boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Text style={{ fontWeight: isDragging ? 'bold' : 'normal' }}>
              {item.title}
            </Text>
            <View 
              className="drag-handle" 
              {...dragHandleProps}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '4px',
              }}
            >
              <DragHandleIcon color="#666" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default DragListExample; 