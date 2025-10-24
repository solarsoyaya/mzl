<template>
  <div class="min-h-screen bg-white">
    <!-- 侧边栏 -->
    <Sidebar
      :conversations="conversations"
      :active-conversation-id="activeConversationId"
      @toggle-collapse="handleSidebarToggle"
      @create-conversation="createNewConversation"
      @select-conversation="selectConversation"
      @delete-conversation="deleteConversation"
    />

    <!-- 主内容区域 -->
    <div 
      :class="[
        'fixed top-0 right-0 bottom-0 flex flex-col transition-all duration-300',
        isSidebarCollapsed ? 'left-12' : 'left-64'
      ]"
    >
      <ChatInterface
        :messages="currentMessages"
        :is-typing="isTyping"
        :is-ai-responding="isAIResponding"
        :active-tab="activeTab"
        @send-message="handleSendMessage"
        @quick-command="handleQuickCommand"
        @file-upload="handleFileUpload"
        @generate-report="handleGenerateReport"
        @one-click-report="handleOneClickReport"
        @clear-chat="clearCurrentChat"
        @show-notification="showNotification"
        @show-phone-modal="showPhoneModal = true"
      />
    </div>
  </div>

  <!-- 汇报模态框 -->
  <ReportModal
    :isVisible="showReportModal"
    @confirm="handleReportConfirm"
    @cancel="handleReportCancel"
  />

  <!-- 确认模态框 -->
  <ConfirmModal
    :is-visible="showConfirmModal"
    :event-type="confirmData.eventType"
    :message="confirmData.message"
    :departments="confirmData.departments"
    @confirm="handleConfirmReport"
    @cancel="handleConfirmCancel"
  />

  <!-- 通知模态框 -->
  <NotificationModal
    :isVisible="notification.isVisible"
    :type="notification.type"
    :title="notification.title"
    :message="notification.message"
    :confirmText="notification.confirmText"
    :cancelText="notification.cancelText"
    :autoClose="notification.autoClose"
    :autoCloseDelay="notification.autoCloseDelay"
    @close="closeNotification"
    @confirm="confirmNotification"
    @cancel="cancelNotification"
  />

  <!-- 模拟打电话模态框 -->
  <PhoneCallModal
    :isVisible="showPhoneModal"
    @close="closePhoneModal"
  />
</template>

<script>
import { ref, onMounted, computed, reactive, nextTick } from 'vue'
import ChatInterface from './components/ChatInterface.vue'
import Sidebar from './components/Sidebar.vue'
import ReportModal from './components/ReportModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import NotificationModal from './components/NotificationModal.vue'
import PhoneCallModal from './components/PhoneCallModal.vue'
import { messageTemplates, conversationScenarios } from './data/mockData.js'
import dayjs from 'dayjs'

export default {
  name: 'App',
  components: {
    ChatInterface,
    Sidebar,
    ReportModal,
    ConfirmModal,
    NotificationModal,
    PhoneCallModal
  },
  setup() {
    const activeTab = ref('equipment')
    const isTyping = ref(false)
    const isAIResponding = ref(false)
    const isSidebarCollapsed = ref(false)
    
    // 对话管理
    const conversations = ref([])
    const activeConversationId = ref(null)
    
    // 模态框状态管理
    const showReportModal = ref(false)
    const showConfirmModal = ref(false)
    const confirmData = reactive({
      eventType: '',
      message: '',
      departments: []
    })

    // 通知系统状态管理
    const notification = reactive({
      isVisible: false,
      type: 'info',
      title: '',
      message: '',
      confirmText: '',
      cancelText: '',
      autoClose: false,
      autoCloseDelay: 3000,
      onConfirm: null,
      onCancel: null
    })

    // 模拟打电话模态框状态管理
    const showPhoneModal = ref(false)
    
    const tabs = [
      { id: 'equipment', name: '设备管家' },
      { id: 'emergency', name: '应急处置' }
    ]

    // 获取当前对话的消息
    const currentMessages = computed(() => {
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      return currentConversation ? currentConversation.messages : []
    })

    // 生成唯一ID
    const generateId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    // 创建新对话
    const createNewConversation = () => {
      const newConversation = {
        id: generateId(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessage: null
      }
      
      conversations.value.unshift(newConversation)
      activeConversationId.value = newConversation.id
      saveConversations()
    }

    // 选择对话
    const selectConversation = (conversationId) => {
      activeConversationId.value = conversationId
    }

    // 删除对话
    const deleteConversation = (conversationId) => {
      const index = conversations.value.findIndex(c => c.id === conversationId)
      if (index === -1) return
      
      conversations.value.splice(index, 1)
      
      // 如果删除的是当前对话，切换到第一个对话
      if (conversationId === activeConversationId.value) {
        if (conversations.value.length > 0) {
          activeConversationId.value = conversations.value[0].id
        } else {
          // 如果没有对话了，创建一个新的
          createNewConversation()
        }
      }
      
      saveConversations()
    }

    // 更新对话标题
    const updateConversationTitle = (conversationId, title) => {
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (conversation) {
        conversation.title = title
        conversation.updatedAt = Date.now()
        saveConversations()
      }
    }

    // 保存对话到localStorage
    const saveConversations = () => {
      localStorage.setItem('hospital-conversations', JSON.stringify(conversations.value))
      localStorage.setItem('hospital-active-conversation', activeConversationId.value)
    }

    // 从localStorage加载对话
    const loadConversations = () => {
      try {
        const saved = localStorage.getItem('hospital-conversations')
        const activeId = localStorage.getItem('hospital-active-conversation')
        
        if (saved) {
          conversations.value = JSON.parse(saved)
          activeConversationId.value = activeId
        }
        
        // 如果没有对话，创建一个默认对话
        if (conversations.value.length === 0) {
          createNewConversation()
        }
      } catch (error) {
        console.error('加载对话失败:', error)
        createNewConversation()
      }
    }

    // 初始化
    const initializeChat = () => {
      loadConversations()
    }

    // 处理发送消息
    const handleSendMessage = async (message) => {
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (!currentConversation) return

      // 检查是否是技术咨询问题
      const technicalAnswer = messageTemplates.technicalAnswers && messageTemplates.technicalAnswers[message]
      if (technicalAnswer) {
        // 添加用户消息
        const userMessage = {
          type: 'user',
          content: message,
          timestamp: Date.now()
        }
        currentConversation.messages.push(userMessage)
        
        // 更新对话信息
        currentConversation.lastMessage = message.length > 30 ? message.substring(0, 30) + '...' : message
        currentConversation.updatedAt = Date.now()
        
        // 显示AI回复
        isTyping.value = true
        
        setTimeout(() => {
          isTyping.value = false
          
          // 添加AI消息（初始为空，用于打字机效果）
          const aiMessage = {
            type: 'ai',
            content: '',
            timestamp: Date.now(),
            isTyping: true,
            followUp: technicalAnswer.followUp || []
          }
          
          currentConversation.messages.push(aiMessage)
          
          // 使用打字机效果显示技术回答
          typewriterEffect(technicalAnswer.aiResponse, currentConversation.messages.length - 1, currentConversation)
          
          saveConversations()
        }, 1500)
        
        return
      }

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: message,
        timestamp: Date.now()
      }
      
      currentConversation.messages.push(userMessage)
      
      // 更新对话信息
      currentConversation.lastMessage = message.length > 30 ? message.substring(0, 30) + '...' : message
      currentConversation.updatedAt = Date.now()
      
      // 如果是第一条消息，更新对话标题
      if (currentConversation.messages.length === 1) {
        currentConversation.title = message.length > 20 ? message.substring(0, 20) + '...' : message
      }

      // 模拟AI思考
      isTyping.value = true
      
      // 延迟回复
      setTimeout(() => {
        isTyping.value = false
        
        // 根据消息内容生成回复（已包含打字机效果）
        generateAIResponse(message)
      }, 1500)
      
      saveConversations()
    }

    // 生成AI回复
    const generateAIResponse = (userMessage) => {
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (!currentConversation) return

      const message = userMessage.toLowerCase()
      let responseContent = ''
      let actions = []
      
      if (message.includes('保养') || message.includes('设备')) {
        responseContent = conversationScenarios.equipmentMaintenance.aiResponse
        actions = conversationScenarios.equipmentMaintenance.followUp
      } else if (message.includes('漏水') || message.includes('故障') || message.includes('紧急')) {
        responseContent = conversationScenarios.emergencyResponse.aiResponse
        actions = conversationScenarios.emergencyResponse.followUp
      } else if (message.includes('生成事件汇报') || message.includes('事件汇报')) {
        responseContent = `美智同学："好的，我来帮您生成漏水事件汇报。

**事件汇报模板**

📋 **事件标题**：综合楼七楼空调冷冻水管漏水
⏰ **发生时间**：${new Date().toLocaleString('zh-CN')}
📍 **事件地点**：综合楼七楼
🎯 **影响范围**：A2-A5病区空调供冷可能受影响

**事件描述**
发现综合楼七楼空调冷冻水管出现漏水情况，需要立即处理以避免影响病区正常运行。

**已采取措施**
✅ 已联系工程技工携带接水盘、围挡等应急设备
✅ 已通知相关管理人员
✅ 已安排值班人员查看各病房情况

**负责人**：现场发现人员
**下一步计划**：等待工程技工到场进行专业维修

**联系方式**
需要联系相关人员时，请点击下方按钮选择科室和人员进行联系。

这份汇报我已经为您准备好了，您可以直接使用或根据实际情况进行调整。"`
        actions = ['导出Excel汇报', '查看历史汇报', '联系现场人员']
      } else {
        responseContent = '我理解您的问题。作为美智同学，我可以帮您处理设备保养、应急事件、故障排查等工作。请您详细描述一下具体需要什么帮助？'
      }
      
      // 创建AI消息对象
      const aiMessage = {
        type: 'ai',
        content: '',
        timestamp: Date.now(),
        isTyping: true,
        actions: actions
      }
      
      // 添加空消息到当前对话
      currentConversation.messages.push(aiMessage)
      
      // 开始打字机效果
      typewriterEffect(responseContent, currentConversation.messages.length - 1, currentConversation)
      
      return aiMessage
    }

    // 处理快捷指令
    const handleQuickCommand = (command) => {
      // 防重复点击：如果AI正在响应，直接返回
      if (isAIResponding.value) {
        return
      }
      
      // 获取当前对话
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (!currentConversation) return
      
      // 特殊处理新增的两个功能
      if (command.id === 'analyze-equipment-plan') {
        handleAnalyzeEquipmentPlan()
        return
      }
      
      if (command.id === 'one-click-report') {
        handleOneClickReport()
        return
      }
      
      // 立即设置AI响应状态，防止重复点击
      isAIResponding.value = true

      // 更新对话信息（不添加用户消息，直接显示AI回复）
      currentConversation.lastMessage = command.title.length > 30 ? command.title.substring(0, 30) + '...' : command.title
      currentConversation.updatedAt = Date.now()
      
      // 如果是第一条消息，更新对话标题
      if (currentConversation.messages.length === 0) {
        currentConversation.title = command.title.length > 20 ? command.title.substring(0, 20) + '...' : command.title
      }

      // 显示打字状态
      isTyping.value = true
      
      // 延迟显示AI回复，使用打字机效果
      setTimeout(() => {
        isTyping.value = false
        
        // 创建AI消息对象
        const aiMessage = {
          type: 'ai',
          content: '',
          timestamp: Date.now(),
          isTyping: true
        }
        
        // 添加空消息到当前对话
        currentConversation.messages.push(aiMessage)
        
        // 开始打字机效果
        typewriterEffect(command.content, currentConversation.messages.length - 1, currentConversation)
      }, 1000)
      
      // 保存对话
      saveConversations()
    }
    
    // 打字机效果函数
    const typewriterEffect = (fullText, messageIndex, conversation) => {
      let currentText = ''
      let currentIndex = 0
      
      // 开始AI响应状态
      isAIResponding.value = true
      
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          // 随机选择添加1-3个字符
          const charsToAdd = Math.floor(Math.random() * 3) + 1
          const endIndex = Math.min(currentIndex + charsToAdd, fullText.length)
          
          currentText += fullText.slice(currentIndex, endIndex)
          currentIndex = endIndex
          
          // 更新消息内容
          if (conversation.messages[messageIndex]) {
            conversation.messages[messageIndex].content = currentText
          }
        } else {
          // 打字完成
          clearInterval(typeInterval)
          if (conversation.messages[messageIndex]) {
            conversation.messages[messageIndex].isTyping = false
          }
          
          // 更新对话信息
          conversation.lastMessage = fullText.length > 30 ? fullText.substring(0, 30) + '...' : fullText
          conversation.updatedAt = Date.now()
          
          // 结束AI响应状态
          isAIResponding.value = false
          
          // 保存对话
          saveConversations()
        }
      }, Math.random() * 50 + 30) // 30-80ms的随机延迟
    }

    // 处理文件上传
    const handleFileUpload = (file) => {
      console.log('文件上传:', file)
      
      // 检测是否为xlsx文件且文件名包含"台账"
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) && file.name.includes('台账')) {
        // 触发台账分析功能
        handleAnalyzeEquipmentPlan(file.name)
      } else {
        // 普通文件上传处理
        const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
        if (currentConversation) {
          const userMessage = {
            type: 'user',
            content: `已上传文件：${file.name}`,
            timestamp: Date.now()
          }
          currentConversation.messages.push(userMessage)
          
          const aiMessage = {
            type: 'ai',
            content: `收到您上传的文件"${file.name}"。我可以帮您分析文件内容或提供相关建议。请告诉我您希望如何处理这个文件？`,
            timestamp: Date.now(),
            isTyping: false
          }
          currentConversation.messages.push(aiMessage)
          
          saveConversations()
        }
      }
    }

    // 处理生成报告
    const handleGenerateReport = () => {
      console.log('生成报告')
      
      // 生成工作汇报内容
      const reportContent = `**工作汇报 - ${dayjs().format('YYYY年MM月DD日')}**

**今日工作概况：**

**设备维护情况：**
- 完成设备巡检：15台
- 处理故障工单：3件
- 预防性保养：2项
- 设备完好率：96.8%

**具体工作内容：**

1. **设备巡检**
   - CT扫描仪日常检查 ✓
   - 呼吸机功能测试 ✓
   - 心电监护仪校准 ✓
   - 手术室设备检查 ✓

2. **故障处理**
   - 综合楼空调漏水问题 - 已修复
   - 电梯A3通讯故障 - 联系维保公司处理中
   - 氧气站压力异常 - 已切换备用系统

3. **保养工作**
   - 污水处理设备月度保养 - 已完成
   - 手术室空调过滤网更换 - 已完成

**存在问题：**
- 部分设备备件库存不足
- 需要加强夜间巡检频次

**明日计划：**
- 继续跟进电梯维修进度
- 完成氧气站主系统检修
- 采购紧缺备件

**工作建议：**
- 建议增加设备预防性保养频次
- 完善应急预案和备用系统切换流程

---
*报告生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}*`

      // 添加到当前对话
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (currentConversation) {
        // 添加用户请求消息
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: '生成工作汇报',
          timestamp: Date.now()
        }
        
        // 添加AI回复消息
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: reportContent,
          timestamp: Date.now() + 100
        }
        
        currentConversation.messages.push(userMessage, aiMessage)
        currentConversation.lastMessage = '生成了工作汇报'
        currentConversation.updatedAt = Date.now()
        
        saveConversations()
      }
    }

    // 清空当前聊天
    const clearCurrentChat = () => {
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (currentConversation) {
        currentConversation.messages = []
        currentConversation.lastMessage = null
        currentConversation.updatedAt = Date.now()
        saveConversations()
      }
      isTyping.value = false
      isAIResponding.value = false
    }

    // 处理侧边栏切换
    const handleSidebarToggle = (collapsed) => {
      isSidebarCollapsed.value = collapsed
    }

    // 处理分析台账功能
    const handleAnalyzeEquipmentPlan = (fileName = '2025年度空调风柜台账.xlsx') => {
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (!currentConversation) return

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: `已上传文件：${fileName}`,
        timestamp: Date.now()
      }
      currentConversation.messages.push(userMessage)

      // 设置对话标题
      if (currentConversation.messages.length === 1) {
        currentConversation.title = '台账分析'
      }

      // 显示分析过程
      isTyping.value = true
      isAIResponding.value = true
      
      // 创建一个AI消息，包含进度条 - 使用reactive确保响应式更新
      const aiMessage = reactive({
        type: 'ai',
        content: `正在分析"${fileName}"...`,
        timestamp: Date.now(),
        isTyping: false,
        showProgress: true,
        progress: 0
      })
      currentConversation.messages.push(aiMessage)
      
      // 随机生成3-6秒的总时间
      const totalTime = Math.random() * 3000 + 3000 // 3000-6000ms
      
      // 进度条动画 - 使用更可靠的更新机制
      let currentProgress = 0
      let progressInterval = null
      console.log('🚀 开始进度条动画，总时间:', totalTime + 'ms')
      
      // 使用nextTick确保DOM更新
      nextTick(() => {
        progressInterval = setInterval(() => {
          try {
            // 计算每次增量，使用2-4%的增量让动画更平滑
            const increment = Math.random() * 2 + 2 // 2-4%
            currentProgress += increment
            
            // 确保不超过95%（留5%给最终完成）
            if (currentProgress > 95) {
              currentProgress = 95
            }
            
            // 直接更新reactive对象的progress属性
            aiMessage.progress = Math.floor(currentProgress)
            
            console.log('📊 进度更新:', Math.floor(currentProgress) + '%')
            
            // 如果达到95%，停止进度条
            if (currentProgress >= 95) {
              if (progressInterval) {
                clearInterval(progressInterval)
                progressInterval = null
              }
              console.log('✅ 进度条达到95%，准备完成')
            }
          } catch (error) {
            console.error('❌ 进度条更新出错:', error)
            if (progressInterval) {
              clearInterval(progressInterval)
              progressInterval = null
            }
          }
        }, 100) // 每100ms更新一次
      })
      
      // 完成分析
      setTimeout(() => {
        try {
          // 确保清理定时器
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
          }
          
          // 使用nextTick确保最终更新
          nextTick(() => {
            // 直接更新reactive对象
            aiMessage.progress = 100
            aiMessage.showProgress = false
            
            // 准备分析结果内容
            const analysisResult = `**台账分析完成** ✅

**文件信息：**
📄 文件名：${fileName}
📊 数据条目：156条
🕒 分析时间：${Math.ceil(totalTime/1000)}秒

**分析结果：**

**1. 设备概况**
- 空调风柜总数：24台
- 正常运行：22台 (91.7%)
- 需要保养：2台 (8.3%)

**2. 保养计划建议**
- 紧急保养：2台设备需立即处理
- 定期保养：建议每季度进行
- 预防性维护：建议增加月度检查

**3. 风险提醒**
⚠️ 发现2台设备超期未保养
⚠️ 建议优先处理7楼和12楼设备

**4. 成本预估**
- 预计保养费用：¥8,500
- 建议备件采购：¥12,000
- 预计完成时间：3-5个工作日

**下一步建议：**
1. 立即安排紧急保养
2. 制定详细保养计划
3. 准备必要的备件和工具

**📥 下载保养计划：**`
            
            // 添加下载按钮的actions数组
            aiMessage.actions = ['下载保养计划']
            
            // 清空内容，准备打字机效果
            aiMessage.content = ''
            aiMessage.isTyping = true
            
            // 使用打字机效果显示分析结果
            typewriterEffect(analysisResult, currentConversation.messages.length - 1, currentConversation)
            
            console.log('🎉 台账分析完成，开始打字机效果')
          })
        } catch (error) {
          console.error('❌ 完成分析时出错:', error)
          // 确保清理定时器
          if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
          }
          isTyping.value = false
          isAIResponding.value = false
        }
      }, totalTime)
      
      // 安全清理：确保定时器不会泄漏
      setTimeout(() => {
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
          console.log('⚠️ 安全清理：强制停止进度条定时器')
        }
      }, totalTime + 2000) // 比预期时间多2秒的安全边界
    }

    // 处理一键汇报功能
    const handleOneClickReport = () => {
      showReportModal.value = true
    }

    // 处理汇报确认
    const handleReportConfirm = (data) => {
      const { content, files } = data
      
      // 关闭汇报模态框
      showReportModal.value = false
      
      // 检测是否为紧急事件
      const isEmergency = content.includes('漏水') || content.includes('故障') || content.includes('紧急') || content.includes('事故')
      
      if (isEmergency) {
        // 设置确认框数据
        confirmData.eventType = '大面积漏水'
        confirmData.message = '已识别到"大面积漏水"，判断为一类紧急事件，是否立即同步汇报至保洁部门、工程部门相关人员。'
        confirmData.departments = ['保洁部门', '工程部门']
        
        // 显示确认模态框
        showConfirmModal.value = true
      } else {
        // 非紧急事件，直接处理
        processReport(content, files, false)
      }
    }

    // 处理汇报取消
    const handleReportCancel = () => {
      showReportModal.value = false
    }

    // 处理确认汇报
    const handleConfirmReport = () => {
      showConfirmModal.value = false
      // 处理紧急汇报
      processReport('', [], true)
    }

    // 处理确认取消
    const handleConfirmCancel = () => {
      showConfirmModal.value = false
    }

    // 处理汇报逻辑
    const processReport = (content, files, isEmergency) => {
      const currentConversation = conversations.value.find(c => c.id === activeConversationId.value)
      if (!currentConversation) return

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: content || '综合楼七楼空调冷冻水管漏水，请立即支援',
        timestamp: Date.now()
      }
      currentConversation.messages.push(userMessage)

      // 设置对话标题
      if (currentConversation.messages.length === 1) {
        currentConversation.title = '一键汇报'
      }

      // AI分析并回复
      isTyping.value = true
      isAIResponding.value = true
      
      setTimeout(() => {
        isTyping.value = false
        
        let aiResponse = ''
        
        if (isEmergency) {
          aiResponse = conversationScenarios.emergencyResponse.aiResponse
        } else {
          aiResponse = `收到您的汇报，正在分析事件内容...\n\n**汇报内容分析：**\n- 事件性质：一般工作汇报\n- 处理优先级：正常\n- 建议处理方式：按标准流程处理\n\n**已自动生成汇报记录，相关信息将同步至管理系统。**`
        }
        
        const aiMessage = {
          type: 'ai',
          content: '',
          timestamp: Date.now(),
          isTyping: true,
          actions: isEmergency ? ['查看处理进度', '联系现场人员'] : ['生成汇报文档', '联系相关人员'],
          followUp: isEmergency ? conversationScenarios.emergencyResponse.followUp : []
        }
        
        currentConversation.messages.push(aiMessage)
        
        // 开始打字机效果
        typewriterEffect(aiResponse, currentConversation.messages.length - 1, currentConversation)
      }, 2000)
    }
    // 组件挂载时初始化
    onMounted(() => {
      initializeChat()
    })

    // 显示通知的方法
    const showNotification = (options) => {
      notification.isVisible = true
      notification.type = options.type || 'info'
      notification.title = options.title || ''
      notification.message = options.message || ''
      notification.confirmText = options.confirmText || ''
      notification.cancelText = options.cancelText || ''
      notification.autoClose = options.autoClose !== false
      notification.autoCloseDelay = options.autoCloseDelay || 3000
      notification.onConfirm = options.onConfirm || null
      notification.onCancel = options.onCancel || null
    }

    // 关闭通知的方法
    const closeNotification = () => {
      notification.isVisible = false
      notification.onConfirm = null
      notification.onCancel = null
    }

    // 确认通知的方法
    const confirmNotification = () => {
      if (notification.onConfirm) {
        notification.onConfirm()
      }
      closeNotification()
    }

    // 取消通知的方法
    const cancelNotification = () => {
      if (notification.onCancel) {
        notification.onCancel()
      }
      closeNotification()
    }

    // 关闭模拟打电话模态框的方法
    const closePhoneModal = () => {
      showPhoneModal.value = false
    }

    return {
      activeTab,
      currentMessages,
      conversations,
      activeConversationId,
      isTyping,
      isAIResponding,
      isSidebarCollapsed,
      tabs,
      showReportModal,
      showConfirmModal,
      confirmData,
      notification,
      handleSendMessage,
      handleQuickCommand,
      handleFileUpload,
      handleGenerateReport,
      clearCurrentChat,
      handleSidebarToggle,
      createNewConversation,
      selectConversation,
      deleteConversation,
      handleAnalyzeEquipmentPlan,
      handleOneClickReport,
      handleReportConfirm,
      handleReportCancel,
      handleConfirmReport,
      handleConfirmCancel,
      showNotification,
      closeNotification,
      confirmNotification,
      cancelNotification,
      showPhoneModal,
      closePhoneModal
    }
  }
}
</script>