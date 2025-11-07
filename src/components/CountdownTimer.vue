<template>
  <div class="inline-flex items-center space-x-1" :class="timerClass">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span :class="textSizeClass">
      {{ timeRemaining }}
    </span>
    <span v-if="isOvertime" class="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">已超时</span>
    <span v-else-if="isWarning" class="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">即将超时</span>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'CountdownTimer',
  props: {
    deadline: {
      type: [String, Date],
      required: true
    },
    status: {
      type: String,
      default: 'pending'
    },
    size: {
      type: String,
      default: 'normal', // 'normal' or 'large'
      validator: (value) => ['normal', 'large'].includes(value)
    }
  },
  emits: ['timeout'],
  setup(props, { emit }) {
    const now = ref(new Date())
    let timer = null

    // 计算剩余时间
    const timeRemaining = computed(() => {
      const deadline = new Date(props.deadline)
      const diff = deadline - now.value

      if (diff <= 0) {
        return '00:00:00'
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })

    // 是否已超时
    const isOvertime = computed(() => {
      const deadline = new Date(props.deadline)
      return now.value > deadline
    })

    // 是否即将超时（30分钟内）
    const isWarning = computed(() => {
      if (props.status === 'completed') return false
      const deadline = new Date(props.deadline)
      const diff = deadline - now.value
      const hours = diff / (1000 * 60 * 60)
      return hours > 0 && hours <= 0.5
    })

    // 计算时间状态
    const timeStatus = computed(() => {
      if (props.status === 'completed') {
        return 'completed'
      }

      const deadline = new Date(props.deadline)
      const diff = deadline - now.value
      const hours = diff / (1000 * 60 * 60)

      if (diff <= 0) {
        return 'overtime'
      } else if (hours < 0.5) {
        return 'warning'
      } else if (hours < 2) {
        return 'attention'
      } else {
        return 'normal'
      }
    })

    // 样式类
    const timerClass = computed(() => {
      switch (timeStatus.value) {
        case 'completed':
          return 'text-green-600'
        case 'overtime':
          return 'text-red-600 animate-pulse'
        case 'warning':
          return 'text-orange-600 animate-pulse'
        case 'attention':
          return 'text-yellow-600'
        case 'normal':
        default:
          return 'text-blue-600'
      }
    })

    const textSizeClass = computed(() => {
      return props.size === 'large' ? 'text-lg font-bold' : 'text-sm font-medium'
    })

    // 更新时间
    const updateTime = () => {
      now.value = new Date()
      
      // 检查是否刚刚超时
      const deadline = new Date(props.deadline)
      const diff = deadline - now.value
      
      if (diff <= 0 && diff > -1000) { // 刚刚超时（1秒内）
        emit('timeout')
      }
    }

    // 启动定时器
    const startTimer = () => {
      timer = setInterval(updateTime, 1000)
    }

    // 停止定时器
    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    onMounted(() => {
      startTimer()
    })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      timeRemaining,
      isOvertime,
      timeStatus,
      timerClass,
      textSizeClass,
      isWarning
    }
  }
}
</script>

<style scoped>
/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 倒计时数字字体 */
.text-lg {
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.text-sm {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}
</style>