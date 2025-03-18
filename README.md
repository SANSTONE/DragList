# DragList 可拖拽排序列表

DragList 是一个针对 Ray.js 环境优化的可拖拽排序列表组件，支持流畅的实时动画效果，拖拽时其他项目会平滑移动，提供出色的用户体验。

## 特性亮点

- **流畅的拖拽体验**：
  - 实时响应触摸事件，无需长按即可拖拽
  - 拖拽时其他项目会平滑过渡到新位置，具有流畅的动画效果
  - 支持快速跨多个项目拖拽，所有项目实时移动让出空间

- **强大的视觉反馈**：
  - 拖拽时提供振动反馈
  - 拖拽项有阴影和透明度变化，更易区分
  - 其他项目平滑移动提供明确的视觉引导

- **优化的性能**：
  - 基于CSS transform实现高性能动画
  - 智能计算最佳插入位置
  - 减少不必要的重绘和状态更新

## 安装

该组件已包含在项目中，无需额外安装。

## 使用方法

```jsx
import React, { useState } from 'react';
import DragList, { DragHandleIcon } from '@/components/DragList';
import { View, Text } from '@ray-js/components';

const MyComponent = () => {
  const [items, setItems] = useState([
    { id: 1, title: '项目1', color: '#f2a5a5' },
    { id: 2, title: '项目2', color: '#a5c8f2' },
    { id: 3, title: '项目3', color: '#a5f2c0' },
    { id: 4, title: '项目4', color: '#e2f2a5' },
  ]);

  const handleReorder = (newItems) => {
    setItems(newItems);
    console.log('列表已重新排序:', newItems.map(item => item.title));
  };

  return (
    <View style={{ padding: '16px' }}>
      <Text style={{ marginBottom: '16px' }}>
        拖拽列表示例 (点击拖动手柄进行排序)
      </Text>
      
      <DragList
        data={items}
        onReorder={handleReorder}
        itemHeight={70} // 指定项目高度
        animationDuration={150} // 设置动画时间
        vibrateOnChange={true} // 启用振动反馈
        renderItem={(item, index, isDragging, dragHandleProps) => (
          <View 
            style={{ 
              backgroundColor: item.color, 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}
          >
            <Text>{item.title}</Text>
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

export default MyComponent;
```
https://github.com/SANSTONE/DragList/blob/main/1_1742279407.mp4
## 参数

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| data | Array | - | 要渲染的数据数组，每项必须包含id属性 |
| renderItem | Function | - | 渲染列表项的函数 |
| onReorder | Function | - | 重排序完成后的回调，接收新的数据数组 |
| itemHeight | Number | 60 | 列表项的默认高度 |
| className | String | '' | 附加的CSS类名 |
| style | Object | {} | 内联样式 |
| dragHandleClassName | String | 'drag-handle' | 拖拽手柄的CSS类名 |
| animationDuration | Number | 150 | 项目移动动画的持续时间(ms) |
| vibrateOnChange | Boolean | true | 拖拽变化时是否震动 |

## renderItem 函数参数

`renderItem` 函数接收以下参数：

- `item`: 当前渲染项的数据
- `index`: 当前项在列表中的索引
- `isDragging`: 当前项是否处于拖拽状态
- `dragHandleProps`: 需要传递给拖拽手柄的属性，包含 `onTouchStart` 和 `onClick`

## 工作原理

1. **实时拖拽**：当用户拖动项目时，该项目会跟随手指移动
2. **动态位置计算**：组件会实时计算拖拽项应该在的位置
3. **平滑过渡**：其他项目会使用CSS动画平滑地移动到新位置，为拖拽项让出空间
4. **完成排序**：当用户释放拖拽项时，列表会更新到新的顺序，并调用回调函数

## 注意事项

1. 确保每个列表项都有唯一的 `id` 属性，这对于正确渲染和排序至关重要。
2. 要设置 `itemHeight` 属性以匹配您的实际项目高度，这有助于计算正确的位置。
3. 可以通过 `animationDuration` 调整动画速度，较短的时间会使拖拽感觉更快速，较长的时间会带来更平滑的效果。
4. `renderItem` 函数中可以通过 `isDragging` 参数给拖拽项添加特殊样式。
5. 振动功能依赖于 Ray.js 环境中的 `ty.vibrateShort` 方法，在不支持的环境中会自动禁用。

## 实现细节

DragList 组件使用 React 状态来管理拖拽位置和动画。它内部维护了一个偏移量数组，以计算拖拽过程中每个项目的位置。拖拽项跟随手指移动，而其他项目则通过 CSS `transform` 属性进行过渡动画。这种实现方式既保证了视觉上的流畅性，又维持了良好的性能。 
