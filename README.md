# DragList 可拖拽排序列表

DragList 是一个针对 Ray.js 环境优化的可拖拽排序列表组件，支持长按触发拖拽，拖拽时提供视觉和触觉反馈。

## 功能特点

- 长按触发拖拽，符合移动端操作习惯
- 支持触觉反馈（振动）
- 性能优化，流畅的拖拽体验
- 自定义渲染项目内容
- 可扩展的样式和行为

## 安装

该组件已包含在项目中，无需额外安装。

## 使用方法

```jsx
import React, { useState } from 'react';
import DragList, { DragHandleIcon } from '@/components/DragList';
import { View, Text } from '@ray-js/components';

const MyComponent = () => {
  const [items, setItems] = useState([
    { id: 1, title: '项目1' },
    { id: 2, title: '项目2' },
    { id: 3, title: '项目3' },
    { id: 4, title: '项目4' },
  ]);

  const handleReorder = (newItems) => {
    setItems(newItems);
  };

  return (
    <View>
      <DragList
        data={items}
        onReorder={handleReorder}
        renderItem={(item, index, isDragging, dragHandleProps) => (
          <View className="list-item" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <Text>{item.title}</Text>
            <View className="drag-handle" {...dragHandleProps}>
              <DragHandleIcon color="#999" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default MyComponent;
```

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
| animationDuration | Number | 150 | 过渡动画的持续时间(ms) |
| vibrateOnChange | Boolean | true | 拖拽变化时是否震动 |

## renderItem 函数参数

`renderItem` 函数接收以下参数：

- `item`: 当前渲染项的数据
- `index`: 当前项在列表中的索引
- `isDragging`: 当前项是否处于拖拽状态
- `dragHandleProps`: 需要传递给拖拽手柄的属性，包含 `onTouchStart` 和 `onClick`

## 注意事项

1. 确保每个列表项都有唯一的 `id` 属性。
2. 长按拖拽手柄区域才能触发拖拽操作。
3. 振动功能依赖于 Ray.js 环境中的 `ty.vibrateShort` 方法，在不支持的环境中会自动禁用。 