<template>
  <div class="work-order-integration">
    <!-- 工单系统入口按钮 -->
    <div class="work-order-entry" v-if="showEntry">
      <button
        @click="openWorkOrderSystem"
        class="work-order-btn"
        :class="{ 'has-urgent': hasUrgentWorkOrders }"
      >
        <div class="btn-icon">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
        <span class="btn-text">工单系统</span>
        <span v-if="urgentCount > 0" class="urgent-badge">{{ urgentCount }}</span>
      </button>
    </div>

    <!-- 工单系统主界面 -->
    <div v-if="showWorkOrderSystem" class="work-order-panel">
      <div class="panel-header">
        <h3 class="panel-title">智能工单管理系统</h3>
        <button @click="closeWorkOrderSystem" class="close-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="panel-content">
        <WorkOrderSystem
          :work-orders="workOrders"
          @work-order-updated="handleWorkOrderUpdated"
          @timeout-notification="handleTimeoutNotification"
          @work-order-deleted="handleWorkOrderDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import WorkOrderSystem from './WorkOrderSystem.vue'
import { saveWorkOrdersToStorage, loadWorkOrdersFromStorage, createSampleWorkOrders, createWorkOrderFromChatMessage, getWarningWorkOrders, getOvertimeWorkOrders, autoAssignWorkOrder, WORK_ORDER_STATUS } from '../utils/workOrderData'

export default {
  name: 'WorkOrderIntegration',
  components: { WorkOrderSystem },
  props: {
    showEntry: {
      type: Boolean,
      default: true
    },
    enableAutoDispatch: {
      type: Boolean,
      default: false
    },
    autoDispatchDelay: {
      type: Number,
      default: 2000
    },
    chatMessages: {
      type: Array,
      default: () => []
    }
  },
  emits: ['work-order-created', 'work-order-updated', 'auto-dispatch-confirmed'],
  setup(props, { emit }) {
    const showWorkOrderSystem = ref(false)
    const showAutoDispatchConfirm = ref(false)
    const showTimeoutNotification = ref(false)
    const workOrders = ref([])
    const pendingDispatch = ref({
      workOrder: null,
      group: '',
      timer: null
    })
    const timeoutWorkOrder = ref(null)

    // 计算属性
    const urgentCount = computed(() => {
      const warningOrders = getWarningWorkOrders(workOrders.value, 0.5)
      const overtimeOrders = getOvertimeWorkOrders(workOrders.value)
      return warningOrders.length + overtimeOrders.length
    })

    const hasUrgentWorkOrders = computed(() => urgentCount.value > 0)

    // 方法
    const openWorkOrderSystem = () => {
      showWorkOrderSystem.value = true
    }

    const closeWorkOrderSystem = () => {
      showWorkOrderSystem.value = false
    }

    const closeAutoDispatchConfirm = () => {
      showAutoDispatchConfirm.value = false
      // 清除定时器
      if (pendingDispatch.value.timer) {
        clearTimeout(pendingDispatch.value.timer)
        pendingDispatch.value.timer = null
      }
      // 重置状态
      pendingDispatch.value.workOrder = null
      pendingDispatch.value.group = ''
    }

    const confirmAutoDispatch = () => {
      if (pendingDispatch.value.workOrder) {
        // 执行自动派单
        autoAssignWorkOrder(pendingDispatch.value.workOrder)
        
        // 更新工单状态
        pendingDispatch.value.workOrder.status = WORK_ORDER_STATUS.PROCESSING
        
        // 保存到本地存储
        saveWorkOrdersToStorage(workOrders.value)
        
        // 发送事件
        emit('auto-dispatch-confirmed', pendingDispatch.value.workOrder)
        emit('work-order-updated', pendingDispatch.value.workOrder)
      }
      
      closeAutoDispatchConfirm()
    }

    const closeTimeoutNotification = () => {
      showTimeoutNotification.value = false
      timeoutWorkOrder.value = null
    }

    const handleWorkOrderUpdated = (updatedWorkOrder) => {
      // 更新本地数据
      const index = workOrders.value.findIndex(order => order.id === updatedWorkOrder.id)
      if (index !== -1) {
        workOrders.value[index] = updatedWorkOrder
      }
      
      // 保存到本地存储
      saveWorkOrdersToStorage(workOrders.value)
      
      // 发送事件
      emit('work-order-updated', updatedWorkOrder)
    }

    const handleWorkOrderDeleted = (deletedId) => {
      // 删除本地数据并持久化
      const index = workOrders.value.findIndex(order => order.id === deletedId)
      if (index !== -1) {
        workOrders.value.splice(index, 1)
        saveWorkOrdersToStorage(workOrders.value)
      }
    }

    const handleTimeoutNotification = (workOrderId) => {
      const workOrder = workOrders.value.find(order => order.id === workOrderId)
      if (workOrder) {
        timeoutWorkOrder.value = workOrder
        showTimeoutNotification.value = true
        
        // 3秒后自动关闭通知
        setTimeout(() => {
          closeTimeoutNotification()
        }, 5000)
      }
    }

    // 从聊天消息自动创建工单
    const createWorkOrderFromMessage = async (message) => {
      if (!message || !message.content) return null

      // 检查是否是需要创建工单的关键词
      const keywords = ['门禁', '设备', '故障', '维修', '安装', '投诉', '咨询', '问题', '坏了']
      const hasKeyword = keywords.some(keyword => 
        message.content.toLowerCase().includes(keyword.toLowerCase())
      )

      if (!hasKeyword) return null

      // 创建工单
      const workOrder = createWorkOrderFromChatMessage(message)
      
      if (workOrder) {
        // 添加到工单列表
        workOrders.value.unshift(workOrder)
        
        // 保存到本地存储
        saveWorkOrdersToStorage(workOrders.value)
        
        // 发送事件
        emit('work-order-created', workOrder)
        
        // 如果启用自动派单，显示确认弹窗
        if (props.enableAutoDispatch) {
          await nextTick()
          setTimeout(() => {
            pendingDispatch.value.workOrder = workOrder
            pendingDispatch.value.group = workOrder.processingGroup
            showAutoDispatchConfirm.value = true
          }, props.autoDispatchDelay)
        }
        
        return workOrder
      }
      
      return null
    }

    // 监听聊天消息变化
    watch(() => props.chatMessages, (newMessages, oldMessages) => {
      if (newMessages.length > oldMessages.length) {
        const latestMessage = newMessages[newMessages.length - 1]
        if (latestMessage && latestMessage.sender !== 'system') {
          createWorkOrderFromMessage(latestMessage)
        }
      }
    }, { deep: true })

    // 初始化
    onMounted(() => {
      // 从本地存储加载工单数据
      const storedWorkOrders = loadWorkOrdersFromStorage()
      if (storedWorkOrders.length > 0) {
        workOrders.value = storedWorkOrders
      } else {
        // 创建示例数据
        workOrders.value = createSampleWorkOrders()
        saveWorkOrdersToStorage(workOrders.value)
      }

      // 定期检查超时工单
      setInterval(() => {
        const overtimeOrders = getOvertimeWorkOrders(workOrders.value)
        if (overtimeOrders.length > 0 && !showTimeoutNotification.value) {
          handleTimeoutNotification(overtimeOrders[0].id)
        }
      }, 60000) // 每分钟检查一次
    })

    return {
      showWorkOrderSystem,
      showAutoDispatchConfirm,
      showTimeoutNotification,
      workOrders,
      pendingDispatch,
      timeoutWorkOrder,
      urgentCount,
      hasUrgentWorkOrders,
      openWorkOrderSystem,
      closeWorkOrderSystem,
      closeAutoDispatchConfirm,
      confirmAutoDispatch,
      closeTimeoutNotification,
      handleWorkOrderUpdated,
      handleWorkOrderDeleted,
      handleTimeoutNotification
    }
  }
}
</script>

<style scoped>
.work-order-integration {
  position: relative;
}

/* 工单系统入口按钮样式 */
.work-order-entry {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.work-order-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25), 0 4px 6px -2px rgba(37, 99, 235, 0.1);
  transition: all 0.2s ease;
}

.work-order-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.work-order-btn.has-urgent {
  animation: pulse 1.5s infinite;
}

.btn-icon {
  display: flex;
  align-items: center;
}

.btn-text {
  font-size: 14px;
}

.urgent-badge {
  background: #ef4444;
  color: white;
  border-radius: 9999px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

/* 工单系统面板样式 */
.work-order-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  box-shadow: -20px 0 25px -5px rgba(0, 0, 0, 0.1), -10px 0 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 2000;
  animation: slideInRight 0.25s ease both;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.close-btn .btn-text {
  font-size: 13px;
}

.panel-content {
  height: calc(100% - 53px);
}

/* 自动派单确认弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 24px;
}

.modal-text {
  font-size: 16px;
  color: #374151;
  margin-bottom: 16px;
  line-height: 1.5;
}

.modal-text strong {
  color: #2563eb;
}

.work-order-preview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.preview-item {
  display: flex;
  margin-bottom: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  font-weight: 500;
  color: #64748b;
  min-width: 80px;
}

.preview-value {
  color: #374151;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 12px;
}

/* 超时通知样式 */
.timeout-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  left: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 3000;
}

.notification-content {
  min-width: 380px;
  padding: 16px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.notification-desc {
  font-size: 13px;
  color: #475569;
}

.notification-footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
}

/* 动画效果 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 响应式设计 */
@media (max-width: 920px) {
  .work-order-panel {
    width: 100%;
    left: 0; /* 防止右侧裁剪，铺满屏幕 */
    right: 0;
  }
}

@media (max-width: 768px) {
  .work-order-entry {
    bottom: 16px;
    right: 16px;
  }
  
  .work-order-btn {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .modal-content {
    width: 95%;
    margin: 16px;
  }
  
  .timeout-notification {
    top: 16px;
    right: 16px;
    left: 16px;
  }
  
  .notification-content {
    min-width: auto;
  }
}
</style>