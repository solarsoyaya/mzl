<template>
  <div class="flex flex-col h-screen bg-white">
    <!-- 聊天消息区域 -->
    <div class="flex-1 overflow-hidden">
      <!-- 有消息时显示消息列表 -->
      <div 
        v-if="messages.length > 0"
        class="h-full overflow-y-auto scroll-smooth px-4 py-6"
        ref="messagesContainer"
      >
        <div class="max-w-3xl mx-auto space-y-6">
          <!-- 消息列表 -->
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'flex',
              message.type === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- AI消息 -->
            <div v-if="message.type === 'ai'" class="flex items-start space-x-3 w-full">
              <!-- AI头像 -->
              <div class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">AI</span>
              </div>
              
              <!-- AI消息内容 -->
              <div class="flex-1 min-w-0">
                <div 
                  class="text-gray-900 whitespace-pre-wrap break-words overflow-wrap-anywhere"
                  v-html="formatMessage(message.content)"
                ></div>
                
                <!-- 进度条 -->
                <div v-if="message.showProgress" class="mt-3">
                  <div class="flex items-center space-x-3">
                    <div class="flex-1">
                      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          class="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-full rounded-full will-change-[width] transform-gpu"
                          :style="{ 
                            width: message.progress + '%',
                            transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: 'translateZ(0)'
                          }"
                        >
                          <!-- 添加光泽效果 -->
                          <div class="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div class="text-sm text-gray-700 font-semibold min-w-[3rem] text-right">{{ message.progress }}%</div>
                  </div>
                  <!-- 进度描述 -->
                  <div class="mt-2 text-xs text-gray-500">
                    {{ message.progress < 30 ? '正在解析文件结构...' : 
                        message.progress < 60 ? '正在提取台账数据...' : 
                        message.progress < 90 ? '正在进行趋势分析...' : 
                        '即将完成分析...' }}
                  </div>
                </div>
                
                <!-- 打字指示器 -->
                <div v-if="message.isTyping" class="flex items-center space-x-1 mt-2">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                
                <!-- 操作按钮 -->
                <div v-if="message.actions && message.actions.length > 0" class="flex flex-wrap gap-2 mt-3">
                  <button
                    v-for="action in message.actions"
                    :key="action"
                    @click="handleActionClick(action)"
                    class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {{ action }}
                  </button>
                </div>
                
                <!-- followUp按钮 -->
                <div v-if="message.followUp && message.followUp.length > 0" class="flex flex-wrap gap-2 mt-3">
                  <button
                    v-for="followUp in message.followUp"
                    :key="followUp"
                    @click="handleFollowUpClick(followUp)"
                    class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {{ followUp }}
                  </button>
                </div>
                
                <!-- 时间戳 -->
                 <div class="text-xs text-gray-500 mt-2">{{ formatTimestamp(message.timestamp) }}</div>
              </div>
            </div>

            <!-- 用户消息 -->
            <div v-else class="flex items-start space-x-3 max-w-2xl">
              <div class="flex-1 text-right min-w-0">
                <div class="inline-block bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-full">
                  <div class="whitespace-pre-wrap break-words overflow-wrap-anywhere">{{ message.content }}</div>
                </div>
                <div class="text-xs text-gray-500 mt-2">{{ formatTimestamp(message.timestamp) }}</div>
              </div>
              
              <!-- 用户头像 -->
              <div class="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-gray-600 text-sm">👤</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无消息时显示欢迎界面和快捷指令 -->
      <div v-else class="h-full flex items-center justify-center px-4">
        <FloatingCommands @command-click="handleQuickCommand" />
      </div>

      <!-- 打字指示器（全局） -->
      <div v-if="isTyping && messages.length > 0" class="max-w-3xl mx-auto px-4 pb-4">
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">AI</span>
          </div>
          <div class="bg-gray-50 rounded-2xl px-4 py-3">
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <div class="flex items-center space-x-3">
          <!-- + 号菜单 -->
          <div class="flex-shrink-0">
            <PlusMenu 
              :is-ai-responding="isAIResponding"
              @file-upload="handleFileUpload"
              @generate-report="handleGenerateReport"
              @one-click-report="handleOneClickReport"
              @clear-chat="handleClearChat"
              @show-notification="$emit('show-notification', $event)"
            />
          </div>

          <!-- 输入框容器 -->
          <div class="flex-1 relative">
            <textarea
              v-model="inputMessage"
              @keydown="handleKeyDown"
              @input="adjustTextareaHeight"
              :disabled="isAIResponding"
              placeholder="输入消息..."
              class="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 overflow-hidden"
              rows="1"
              style="min-height: 48px; max-height: 120px; line-height: 1.5;"
              ref="textareaRef"
            ></textarea>
            
            <!-- 发送按钮 -->
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isAIResponding"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, watch, onMounted } from 'vue'
import PlusMenu from './PlusMenu.vue'
import FloatingCommands from './FloatingCommands.vue'
import { marked } from 'marked'
import dayjs from 'dayjs'

export default {
  name: 'ChatInterface',
  components: {
    PlusMenu,
    FloatingCommands
  },
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isTyping: {
      type: Boolean,
      default: false
    },
    isAIResponding: {
      type: Boolean,
      default: false
    },
    activeTab: {
      type: String,
      default: 'equipment'
    }
  },
  emits: ['send-message', 'quick-command', 'file-upload', 'generate-report', 'clear-chat', 'show-phone-modal'],
  setup(props, { emit }) {
    const inputMessage = ref('')
    const messagesContainer = ref(null)
    const textareaRef = ref(null)

    // 格式化时间戳
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return ''
      
      const messageTime = dayjs(timestamp)
      const now = dayjs()
      
      // 如果是今天，只显示时间
      if (messageTime.isSame(now, 'day')) {
        return messageTime.format('HH:mm')
      }
      // 如果是今年，显示月日和时间
      else if (messageTime.isSame(now, 'year')) {
        return messageTime.format('MM-DD HH:mm')
      }
      // 其他情况显示完整日期时间
      else {
        return messageTime.format('YYYY-MM-DD HH:mm')
      }
    }

    // 发送消息
    const sendMessage = () => {
      if (!inputMessage.value.trim() || props.isAIResponding) return
      
      emit('send-message', inputMessage.value.trim())
      inputMessage.value = ''
      
      // 重置textarea高度
      nextTick(() => {
        if (textareaRef.value) {
          textareaRef.value.style.height = '48px'
        }
      })
    }

    // 处理键盘事件
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
      }
    }

    // 自动调整textarea高度
    const adjustTextareaHeight = () => {
      nextTick(() => {
        if (textareaRef.value) {
          textareaRef.value.style.height = '48px'
          textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
        }
      })
    }

    // 处理快捷指令点击
    const handleQuickCommand = (command) => {
      emit('quick-command', command)
    }

    // 处理操作按钮点击
    const handleActionClick = (action) => {
      if (action === '下载保养计划') {
        downloadMaintenancePlan()
      } else if (action === '下载汇报模板') {
        downloadReportTemplate()
      } else if (action.includes('联系')) {
        // 打开模拟打电话模态框
        emit('show-phone-modal')
      } else if (action === '生成汇报文档') {
        downloadReportTemplate()
      } else if (action === '联系相关人员') {
        // 打开模拟打电话模态框
        emit('show-phone-modal')
      }
    }

    // 处理followUp按钮点击
    const handleFollowUpClick = (followUpText) => {
      // 发送followUp文本作为用户消息
      emit('send-message', followUpText)
    }

    // 下载保养计划
    const downloadMaintenancePlan = () => {
      // 创建下载链接指向public目录中的真实Excel文件
      const link = document.createElement('a')
      link.href = '/2026年度空调风柜保养计划.xlsx'
      link.download = '2026年度空调风柜保养计划.xlsx'
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // 下载汇报模板
    const downloadReportTemplate = () => {
      const data = [
        ['日期', '工作内容', '完成情况', '存在问题', '下步计划'],
        ['2024-01-10', '设备巡检', '已完成', '无', '继续按计划执行'],
        ['2024-01-11', '故障处理', '已完成', '备件不足', '及时补充备件']
      ]
      downloadCSV(data, '工作汇报模板.csv')
    }

    // 下载CSV文件
    const downloadCSV = (data, filename) => {
      const csvContent = data.map(row => row.join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // 显示紧急联系方式
    const showEmergencyContacts = () => {
      emit('show-notification', {
        type: 'info',
        title: '🚑 紧急联系电话',
        message: '医院总值班：0571-88888888\n保卫科：0571-88888889\n设备科：0571-88888890',
        confirmText: '知道了',
        autoClose: false
      })
    }

    // 格式化消息（Markdown转HTML）
    const formatMessage = (content) => {
      return marked(content)
    }

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    // 处理文件上传
    const handleFileUpload = (file) => {
      emit('file-upload', file)
    }

    // 处理生成报告
    const handleGenerateReport = () => {
      emit('generate-report')
    }

    // 处理一键汇报
    const handleOneClickReport = () => {
      emit('one-click-report')
    }

    // 处理清空聊天
    const handleClearChat = () => {
      emit('clear-chat')
    }

    // 监听消息变化，自动滚动到底部
    watch(() => props.messages, () => {
      scrollToBottom()
    }, { deep: true })

    // 监听打字状态变化，自动滚动到底部
    watch(() => props.isTyping, () => {
      scrollToBottom()
    })

    return {
       inputMessage,
       messagesContainer,
       textareaRef,
       sendMessage,
       handleKeyDown,
       adjustTextareaHeight,
       handleQuickCommand,
       handleActionClick,
       handleFollowUpClick,
       handleFileUpload,
       handleGenerateReport,
       handleOneClickReport,
       handleClearChat,
       formatMessage,
       formatTimestamp,
       scrollToBottom
     }
  }
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 打字动画 */
@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>