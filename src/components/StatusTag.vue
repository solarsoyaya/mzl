<template>
  <span
    :class="statusClass"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
  >
    <span
      v-if="showDot"
      :class="dotClass"
      class="w-2 h-2 mr-1 rounded-full animate-pulse"
    ></span>
    {{ statusText }}
    <span v-if="status === 'overtime'" class="ml-1 text-xs">⚠️</span>
    <span v-else-if="status === 'processing'" class="ml-1 text-xs">🔄</span>
    <span v-else-if="status === 'completed'" class="ml-1 text-xs">✅</span>
  </span>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatusTag',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ['pending', 'processing', 'completed', 'overtime'].includes(value)
    },
    showDot: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    // 状态映射配置
    const statusConfig = {
      pending: {
        text: '待处理',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-600'
      },
      processing: {
        text: '处理中',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-600'
      },
      completed: {
        text: '已完成',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-600'
      },
      overtime: {
        text: '已超时',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-600'
      }
    }

    const statusText = computed(() => {
      return statusConfig[props.status]?.text || '未知状态'
    })

    const statusClass = computed(() => {
      const config = statusConfig[props.status]
      if (!config) return 'bg-gray-100 text-gray-800 border border-gray-200'
      
      return `${config.bgColor} ${config.textColor} border ${config.borderColor}`
    })

    const dotClass = computed(() => {
      const config = statusConfig[props.status]
      if (!config) return 'bg-gray-600'
      
      return config.dotColor
    })

    return {
      statusText,
      statusClass,
      dotClass
    }
  }
}
</script>

<style scoped>
/* 状态标签动画效果 */
span {
  transition: all 0.2s ease-in-out;
}

/* 悬停效果 */
span:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 脉冲效果（用于处理中状态） */
@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: pulse-dot 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 闪烁效果（用于超时状态） */
@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.5;
  }
}

.blink {
  animation: blink 1s infinite;
}

/* 超时状态特殊样式 */
.bg-red-100 {
  position: relative;
  overflow: hidden;
}

.bg-red-100::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 9999px;
  background: linear-gradient(45deg, transparent 30%, rgba(239, 68, 68, 0.1) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>