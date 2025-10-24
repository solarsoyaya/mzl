<template>
  <!-- 通知模态框 -->
  <div v-if="isVisible" class="notification-overlay" @click="handleOverlayClick">
    <div class="notification-container" @click.stop>
      <!-- 图标区域 -->
      <div class="notification-icon" :class="iconClass">
        <svg v-if="type === 'info'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18218 2.99721 7.13677 4.39828 5.49707C5.79935 3.85736 7.69279 2.71548 9.79619 2.24015C11.8996 1.76482 14.1003 1.98466 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.29 3.86L1.82 18C1.64466 18.3024 1.55611 18.6453 1.56331 18.9945C1.57051 19.3437 1.67319 19.6831 1.86 19.98C2.04681 20.2769 2.31259 20.5187 2.62919 20.6811C2.9458 20.8435 3.30038 20.9205 3.66 20.9H20.34C20.6996 20.9205 21.0542 20.8435 21.3708 20.6811C21.6874 20.5187 21.9532 20.2769 22.14 19.98C22.3268 19.6831 22.4295 19.3437 22.4367 18.9945C22.4439 18.6453 22.3553 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5C3 3.89543 3.89543 3 5 3H8L10 1H14L16 3H19C20.1046 3 21 3.89543 21 5V6H3V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 6H3V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- 内容区域 -->
      <div class="notification-content">
        <h3 v-if="title" class="notification-title">{{ title }}</h3>
        <div class="notification-message" v-html="formattedMessage"></div>
      </div>

      <!-- 关闭按钮 -->
      <button class="notification-close" @click="handleClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- 操作按钮区域 -->
      <div v-if="showActions" class="notification-actions">
        <button v-if="cancelText" class="btn btn-secondary" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button v-if="confirmText" class="btn btn-primary" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue'

export default {
  name: 'NotificationModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info', // info, success, warning, error
      validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: ''
    },
    autoClose: {
      type: Boolean,
      default: false
    },
    autoCloseDelay: {
      type: Number,
      default: 3000
    },
    allowOverlayClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'confirm', 'cancel'],
  setup(props, { emit }) {
    // 计算图标样式类
    const iconClass = computed(() => {
      const baseClass = 'notification-icon-base'
      switch (props.type) {
        case 'success':
          return `${baseClass} notification-icon-success`
        case 'warning':
          return `${baseClass} notification-icon-warning`
        case 'error':
          return `${baseClass} notification-icon-error`
        default:
          return `${baseClass} notification-icon-info`
      }
    })

    // 计算是否显示操作按钮
    const showActions = computed(() => {
      return props.confirmText || props.cancelText
    })

    // 格式化消息内容（支持换行）
    const formattedMessage = computed(() => {
      return props.message.replace(/\n/g, '<br>')
    })

    // 自动关闭定时器
    let autoCloseTimer = null

    // 设置自动关闭
    const setupAutoClose = () => {
      if (props.autoClose && props.isVisible) {
        autoCloseTimer = setTimeout(() => {
          handleClose()
        }, props.autoCloseDelay)
      }
    }

    // 清除自动关闭定时器
    const clearAutoClose = () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
        autoCloseTimer = null
      }
    }

    // 监听可见性变化
    const watchVisible = () => {
      if (props.isVisible) {
        setupAutoClose()
      } else {
        clearAutoClose()
      }
    }

    // 处理关闭
    const handleClose = () => {
      clearAutoClose()
      emit('close')
    }

    // 处理确认
    const handleConfirm = () => {
      clearAutoClose()
      emit('confirm')
    }

    // 处理取消
    const handleCancel = () => {
      clearAutoClose()
      emit('cancel')
    }

    // 处理遮罩点击
    const handleOverlayClick = () => {
      if (props.allowOverlayClose) {
        handleClose()
      }
    }

    // 监听props变化
    watch(() => props.isVisible, watchVisible, { immediate: true })

    return {
      iconClass,
      showActions,
      formattedMessage,
      handleClose,
      handleConfirm,
      handleCancel,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.notification-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 480px;
  padding: 24px;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 auto 16px;
  flex-shrink: 0;
}

.notification-icon-base {
  /* 基础样式 */
}

.notification-icon-info {
  background-color: #dbeafe;
  color: #3b82f6;
}

.notification-icon-success {
  background-color: #dcfce7;
  color: #16a34a;
}

.notification-icon-warning {
  background-color: #fef3c7;
  color: #d97706;
}

.notification-icon-error {
  background-color: #fee2e2;
  color: #dc2626;
}

.notification-content {
  text-align: center;
  margin-bottom: 20px;
}

.notification-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.notification-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  white-space: pre-line;
}

.notification-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.notification-close:hover {
  background-color: #f3f4f6;
  color: #6b7280;
}

.notification-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 80px;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .notification-overlay {
    padding: 16px;
  }
  
  .notification-container {
    padding: 20px;
  }
  
  .notification-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>