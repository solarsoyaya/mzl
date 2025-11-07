// 工单系统数据管理工具

// 生成工单编号
export function generateWorkOrderId() {
  const date = new Date()
  const dateStr = date.getFullYear().toString() + 
                 (date.getMonth() + 1).toString().padStart(2, '0') + 
                 date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `WD-${dateStr}-${random}`
}

// 计算截止时间（默认24小时）
export function calculateDeadline(hours = 24) {
  const deadline = new Date()
  deadline.setHours(deadline.getHours() + hours)
  return deadline
}

// 问题类型分类
export const PROBLEM_TYPES = {
  EQUIPMENT_FAILURE: '设备故障',
  SERVICE_CONSULTATION: '服务咨询',
  COMPLAINT_SUGGESTION: '投诉建议',
  MAINTENANCE_REQUEST: '维护请求',
  EMERGENCY_REPAIR: '紧急维修',
  INSTALLATION_SERVICE: '安装服务'
}

// 处理组分类
export const PROCESSING_GROUPS = {
  EQUIPMENT_MAINTENANCE: '设备维修组',
  CUSTOMER_SERVICE: '客服咨询组',
  COMPREHENSIVE_MAINTENANCE: '综合维修组',
  EMERGENCY_RESPONSE: '应急响应组',
  INSTALLATION_TEAM: '安装服务组'
}

// 工单状态
export const WORK_ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  OVERTIME: 'overtime'
}

// 创建工单
export function createWorkOrder(data) {
  const now = new Date()
  const workOrder = {
    id: generateWorkOrderId(),
    customerName: data.customerName || '',
    customerPhone: data.customerPhone || '',
    problemType: data.problemType || PROBLEM_TYPES.EQUIPMENT_FAILURE,
    description: data.description || '',
    processingGroup: data.processingGroup || PROCESSING_GROUPS.EQUIPMENT_MAINTENANCE,
    status: WORK_ORDER_STATUS.PENDING,
    createdAt: now,
    deadline: calculateDeadline(data.hours || 24),
    processingRecords: [],
    priority: data.priority || 'normal', // normal, urgent, emergency
    source: data.source || 'system' // system, wechat, phone, manual
  }

  // 添加创建记录
  workOrder.processingRecords.push({
    id: Date.now().toString(),
    workOrderId: workOrder.id,
    action: '工单生成',
    description: '工单已创建并等待处理',
    handler: data.creator || '系统',
    timestamp: now
  })

  // 如果有自动分派，添加分派记录
  if (data.autoAssign) {
    workOrder.processingRecords.push({
      id: (Date.now() + 1).toString(),
      workOrderId: workOrder.id,
      action: '自动分派',
      description: `工单已自动分派给${workOrder.processingGroup}`,
      handler: '系统',
      timestamp: new Date(now.getTime() + 1000)
    })
  }

  return workOrder
}

// 更新工单状态
export function updateWorkOrderStatus(workOrder, newStatus, handler, description = '') {
  const oldStatus = workOrder.status
  workOrder.status = newStatus
  
  // 如果完成，设置完成时间
  if (newStatus === WORK_ORDER_STATUS.COMPLETED) {
    workOrder.completedAt = new Date()
  }

  // 添加处理记录
  const record = {
    id: Date.now().toString(),
    workOrderId: workOrder.id,
    action: getStatusActionText(newStatus),
    description: description || getStatusDescription(newStatus, oldStatus),
    handler: handler || '当前用户',
    timestamp: new Date()
  }

  if (!workOrder.processingRecords) {
    workOrder.processingRecords = []
  }
  workOrder.processingRecords.push(record)

  return workOrder
}

// 获取状态操作文本
function getStatusActionText(status) {
  const actionMap = {
    [WORK_ORDER_STATUS.PENDING]: '状态更新',
    [WORK_ORDER_STATUS.PROCESSING]: '开始处理',
    [WORK_ORDER_STATUS.COMPLETED]: '完成工单',
    [WORK_ORDER_STATUS.OVERTIME]: '超时处理'
  }
  return actionMap[status] || '状态更新'
}

// 获取状态描述
function getStatusDescription(newStatus, oldStatus) {
  const descriptionMap = {
    [WORK_ORDER_STATUS.PROCESSING]: '工单状态已更新为处理中',
    [WORK_ORDER_STATUS.COMPLETED]: '工单已处理完成',
    [WORK_ORDER_STATUS.OVERTIME]: '工单已超时，需要紧急处理'
  }
  return descriptionMap[newStatus] || `工单状态从${oldStatus}更新为${newStatus}`
}

// 添加处理记录
export function addProcessingRecord(workOrder, action, description, handler, attachments = []) {
  const record = {
    id: Date.now().toString(),
    workOrderId: workOrder.id,
    action: action,
    description: description,
    handler: handler || '当前用户',
    timestamp: new Date(),
    attachments: attachments
  }

  if (!workOrder.processingRecords) {
    workOrder.processingRecords = []
  }
  workOrder.processingRecords.push(record)

  return workOrder
}

// 检查工单是否即将超时
export function isAboutToTimeout(workOrder, warningHours = 0.5) {
  if (workOrder.status === WORK_ORDER_STATUS.COMPLETED) {
    return false
  }

  const now = new Date()
  const deadline = new Date(workOrder.deadline)
  const timeDiff = deadline - now
  const hours = timeDiff / (1000 * 60 * 60)

  return hours <= warningHours && hours > 0
}

// 检查工单是否已超时
export function isOvertime(workOrder) {
  if (workOrder.status === WORK_ORDER_STATUS.COMPLETED) {
    return false
  }

  const now = new Date()
  const deadline = new Date(workOrder.deadline)
  
  return now > deadline
}

// 获取超时工单
export function getOvertimeWorkOrders(workOrders) {
  return workOrders.filter(order => isOvertime(order))
}

// 获取即将超时工单
export function getWarningWorkOrders(workOrders, warningHours = 0.5) {
  return workOrders.filter(order => isAboutToTimeout(order, warningHours))
}

// 生成处理报告
export function generateProcessingReport(workOrder) {
  const report = {
    workOrderId: workOrder.id,
    customerName: workOrder.customerName,
    problemType: workOrder.problemType,
    status: workOrder.status,
    createdAt: workOrder.createdAt,
    completedAt: workOrder.completedAt,
    deadline: workOrder.deadline,
    processingGroup: workOrder.processingGroup,
    priority: workOrder.priority,
    totalProcessingTime: calculateProcessingTime(workOrder),
    processingRecords: workOrder.processingRecords,
    description: workOrder.description
  }
  
  return report
}

// 计算处理时间
export function calculateProcessingTime(workOrder) {
  if (!workOrder.completedAt) {
    return null
  }
  
  const start = new Date(workOrder.createdAt)
  const end = new Date(workOrder.completedAt)
  const diff = end - start
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return {
    totalMinutes: Math.floor(diff / (1000 * 60)),
    hours,
    minutes,
    formatted: `${hours}小时${minutes}分钟`
  }
}

// 获取工单统计信息
export function getWorkOrderStatistics(workOrders) {
  const total = workOrders.length
  const pending = workOrders.filter(order => order.status === WORK_ORDER_STATUS.PENDING).length
  const processing = workOrders.filter(order => order.status === WORK_ORDER_STATUS.PROCESSING).length
  const completed = workOrders.filter(order => order.status === WORK_ORDER_STATUS.COMPLETED).length
  const overtime = workOrders.filter(order => order.status === WORK_ORDER_STATUS.OVERTIME).length
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const avgProcessingTime = calculateAverageProcessingTime(workOrders)
  
  return {
    total,
    pending,
    processing,
    completed,
    overtime,
    completionRate,
    avgProcessingTime
  }
}

// 计算平均处理时间
export function calculateAverageProcessingTime(workOrders) {
  const completedOrders = workOrders.filter(order => order.completedAt)
  
  if (completedOrders.length === 0) {
    return null
  }
  
  const totalMinutes = completedOrders.reduce((sum, order) => {
    const processingTime = calculateProcessingTime(order)
    return sum + (processingTime ? processingTime.totalMinutes : 0)
  }, 0)
  
  const avgMinutes = Math.floor(totalMinutes / completedOrders.length)
  const hours = Math.floor(avgMinutes / 60)
  const minutes = avgMinutes % 60
  
  return {
    totalMinutes: avgMinutes,
    hours,
    minutes,
    formatted: `${hours}小时${minutes}分钟`
  }
}

// 按问题类型分组统计
export function getProblemTypeStatistics(workOrders) {
  const stats = {}
  
  Object.values(PROBLEM_TYPES).forEach(type => {
    stats[type] = {
      count: 0,
      completed: 0,
      overtime: 0
    }
  })
  
  workOrders.forEach(order => {
    if (stats[order.problemType]) {
      stats[order.problemType].count++
      if (order.status === WORK_ORDER_STATUS.COMPLETED) {
        stats[order.problemType].completed++
      }
      if (order.status === WORK_ORDER_STATUS.OVERTIME) {
        stats[order.problemType].overtime++
      }
    }
  })
  
  return stats
}

// 按处理组分组统计
export function getProcessingGroupStatistics(workOrders) {
  const stats = {}
  
  Object.values(PROCESSING_GROUPS).forEach(group => {
    stats[group] = {
      count: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      overtime: 0
    }
  })
  
  workOrders.forEach(order => {
    if (stats[order.processingGroup]) {
      stats[order.processingGroup].count++
      if (order.status === WORK_ORDER_STATUS.PENDING) {
        stats[order.processingGroup].pending++
      } else if (order.status === WORK_ORDER_STATUS.PROCESSING) {
        stats[order.processingGroup].processing++
      } else if (order.status === WORK_ORDER_STATUS.COMPLETED) {
        stats[order.processingGroup].completed++
      } else if (order.status === WORK_ORDER_STATUS.OVERTIME) {
        stats[order.processingGroup].overtime++
      }
    }
  })
  
  return stats
}

// 搜索工单
export function searchWorkOrders(workOrders, keyword) {
  if (!keyword || keyword.trim() === '') {
    return workOrders
  }
  
  const searchTerm = keyword.toLowerCase().trim()
  
  return workOrders.filter(order => {
    return (
      order.id.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.customerPhone.includes(searchTerm) ||
      order.problemType.toLowerCase().includes(searchTerm) ||
      order.description.toLowerCase().includes(searchTerm) ||
      order.processingGroup.toLowerCase().includes(searchTerm)
    )
  })
}

// 过滤工单
export function filterWorkOrders(workOrders, filters) {
  return workOrders.filter(order => {
    // 状态过滤
    if (filters.status && order.status !== filters.status) {
      return false
    }
    
    // 问题类型过滤
    if (filters.problemType && order.problemType !== filters.problemType) {
      return false
    }
    
    // 处理组过滤
    if (filters.processingGroup && order.processingGroup !== filters.processingGroup) {
      return false
    }
    
    // 优先级过滤
    if (filters.priority && order.priority !== filters.priority) {
      return false
    }
    
    // 日期范围过滤
    if (filters.dateRange) {
      const orderDate = new Date(order.createdAt)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      
      if (orderDate < startDate || orderDate > endDate) {
        return false
      }
    }
    
    return true
  })
}

// 排序工单
export function sortWorkOrders(workOrders, sortBy, sortOrder = 'desc') {
  return workOrders.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'deadline':
        aValue = new Date(a.deadline)
        bValue = new Date(b.deadline)
        break
      case 'priority':
        const priorityOrder = { emergency: 3, urgent: 2, normal: 1 }
        aValue = priorityOrder[a.priority] || 0
        bValue = priorityOrder[b.priority] || 0
        break
      default:
        aValue = a[sortBy]
        bValue = b[sortBy]
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

// 生成工单报告模板
export function generateWorkOrderReportTemplate(workOrder) {
  const processingTime = calculateProcessingTime(workOrder)
  const isOverdue = isOvertime(workOrder)
  
  return {
    title: `工单处理报告 - ${workOrder.id}`,
    content: `
# 工单处理报告

## 基本信息
- 工单编号：${workOrder.id}
- 客户姓名：${workOrder.customerName}
- 客户电话：${workOrder.customerPhone}
- 问题类型：${workOrder.problemType}
- 处理组：${workOrder.processingGroup}
- 优先级：${workOrder.priority}
- 创建时间：${formatDate(workOrder.createdAt)}
- 截止时间：${formatDate(workOrder.deadline)}
${workOrder.completedAt ? `- 完成时间：${formatDate(workOrder.completedAt)}` : ''}
${processingTime ? `- 处理时长：${processingTime.formatted}` : ''}

## 问题描述
${workOrder.description}

## 处理过程
${workOrder.processingRecords.map(record => `
### ${record.action}
- 处理人：${record.handler}
- 处理时间：${formatDate(record.timestamp)}
- 处理说明：${record.description}
`).join('\n')}

## 处理结果
${workOrder.status === 'completed' ? '✅ 工单已处理完成' : 
  workOrder.status === 'overtime' ? '⚠️ 工单已超时，需要紧急处理' :
  workOrder.status === 'processing' ? '🔄 工单正在处理中' :
  '⏳ 工单等待处理中'}

${isOverdue ? '⚠️ 注意：此工单已超出预定处理时间' : ''}
    `,
    status: workOrder.status,
    isOverdue: isOverdue
  }
}

// 日期格式化函数
export function formatDate(date) {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取优先级颜色
export function getPriorityColor(priority) {
  const colorMap = {
    emergency: 'text-red-600 bg-red-100',
    urgent: 'text-orange-600 bg-orange-100',
    normal: 'text-blue-600 bg-blue-100'
  }
  return colorMap[priority] || colorMap.normal
}

// 获取优先级文本
export function getPriorityText(priority) {
  const textMap = {
    emergency: '紧急',
    urgent: '加急',
    normal: '普通'
  }
  return textMap[priority] || textMap.normal
}

// 本地存储管理
export const WORK_ORDER_STORAGE_KEY = 'work_orders'

// 保存工单到本地存储
export function saveWorkOrdersToStorage(workOrders) {
  try {
    localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(workOrders))
    return true
  } catch (error) {
    console.error('保存工单数据失败:', error)
    return false
  }
}

// 从本地存储加载工单
export function loadWorkOrdersFromStorage() {
  try {
    const data = localStorage.getItem(WORK_ORDER_STORAGE_KEY)
    if (data) {
      const workOrders = JSON.parse(data)
      // 恢复日期对象
      return workOrders.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        deadline: new Date(order.deadline),
        completedAt: order.completedAt ? new Date(order.completedAt) : null,
        processingRecords: order.processingRecords.map(record => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }))
      }))
    }
    return []
  } catch (error) {
    console.error('加载工单数据失败:', error)
    return []
  }
}

// 创建示例工单数据
export function createSampleWorkOrders() {
  const sampleData = [
    {
      customerName: '张三',
      customerPhone: '13800138000',
      problemType: PROBLEM_TYPES.EQUIPMENT_FAILURE,
      description: '儿科门诊门禁系统无法正常开启，刷卡无反应，需要紧急维修',
      processingGroup: PROCESSING_GROUPS.EQUIPMENT_MAINTENANCE,
      autoAssign: true,
      creator: '系统自动'
    },
    {
      customerName: '李四',
      customerPhone: '13900139000',
      problemType: PROBLEM_TYPES.SERVICE_CONSULTATION,
      description: '咨询住院部病房预订流程和相关费用标准',
      processingGroup: PROCESSING_GROUPS.CUSTOMER_SERVICE,
      autoAssign: true,
      creator: '系统自动'
    },
    {
      customerName: '王五',
      customerPhone: '13700137000',
      problemType: PROBLEM_TYPES.EMERGENCY_REPAIR,
      description: '手术室空调系统突然停止工作，温度异常升高',
      processingGroup: PROCESSING_GROUPS.EMERGENCY_RESPONSE,
      priority: 'emergency',
      hours: 2,
      autoAssign: true,
      creator: '系统自动'
    },
    {
      customerName: '赵六',
      customerPhone: '13600136000',
      problemType: PROBLEM_TYPES.MAINTENANCE_REQUEST,
      description: '门诊部照明设备需要定期维护保养',
      processingGroup: PROCESSING_GROUPS.COMPREHENSIVE_MAINTENANCE,
      priority: 'normal',
      hours: 48,
      autoAssign: true,
      creator: '系统自动'
    }
  ]

  return sampleData.map(data => createWorkOrder(data))
}

// 与聊天系统集成 - 从聊天消息创建工单
export function createWorkOrderFromChatMessage(message) {
  if (!message || !message.content) return null

  // 简单的关键词检测来确定问题类型
  const content = message.content.toLowerCase()
  let problemType = PROBLEM_TYPES.SERVICE_CONSULTATION
  let processingGroup = PROCESSING_GROUPS.CUSTOMER_SERVICE
  let priority = 'normal'

  if (content.includes('门禁') || content.includes('设备') || content.includes('故障')) {
    problemType = PROBLEM_TYPES.EQUIPMENT_FAILURE
    processingGroup = PROCESSING_GROUPS.EQUIPMENT_MAINTENANCE
  } else if (content.includes('空调') || content.includes('温度') || content.includes('紧急')) {
    problemType = PROBLEM_TYPES.EMERGENCY_REPAIR
    processingGroup = PROCESSING_GROUPS.EMERGENCY_RESPONSE
    priority = 'urgent'
  } else if (content.includes('投诉') || content.includes('建议')) {
    problemType = PROBLEM_TYPES.COMPLAINT_SUGGESTION
    processingGroup = PROCESSING_GROUPS.CUSTOMER_SERVICE
  } else if (content.includes('安装') || content.includes('装修')) {
    problemType = PROBLEM_TYPES.INSTALLATION_SERVICE
    processingGroup = PROCESSING_GROUPS.INSTALLATION_TEAM
  }

  return createWorkOrder({
    customerName: message.sender || '匿名用户',
    customerPhone: '',
    problemType: problemType,
    description: message.content,
    processingGroup: processingGroup,
    priority: priority,
    source: 'chat',
    autoAssign: true,
    creator: '聊天系统自动'
  })
}

// 自动派单规则
export function autoAssignWorkOrder(workOrder) {
  // 根据问题类型和处理组负载自动分派
  const assignmentRules = {
    [PROBLEM_TYPES.EQUIPMENT_FAILURE]: PROCESSING_GROUPS.EQUIPMENT_MAINTENANCE,
    [PROBLEM_TYPES.SERVICE_CONSULTATION]: PROCESSING_GROUPS.CUSTOMER_SERVICE,
    [PROBLEM_TYPES.COMPLAINT_SUGGESTION]: PROCESSING_GROUPS.CUSTOMER_SERVICE,
    [PROBLEM_TYPES.MAINTENANCE_REQUEST]: PROCESSING_GROUPS.COMPREHENSIVE_MAINTENANCE,
    [PROBLEM_TYPES.EMERGENCY_REPAIR]: PROCESSING_GROUPS.EMERGENCY_RESPONSE,
    [PROBLEM_TYPES.INSTALLATION_SERVICE]: PROCESSING_GROUPS.INSTALLATION_TEAM
  }

  workOrder.processingGroup = assignmentRules[workOrder.problemType] || PROCESSING_GROUPS.COMPREHENSIVE_MAINTENANCE
  
  // 添加自动分派记录
  addProcessingRecord(
    workOrder,
    '自动分派',
    `工单已自动分派给${workOrder.processingGroup}`,
    '系统'
  )

  return workOrder
  }
  
  export default {
  generateWorkOrderId,
  calculateDeadline,
  PROBLEM_TYPES,
  PROCESSING_GROUPS,
  WORK_ORDER_STATUS,
  createWorkOrder,
  updateWorkOrderStatus,
  addProcessingRecord,
  isAboutToTimeout,
  isOvertime,
  getOvertimeWorkOrders,
  getWarningWorkOrders,
  generateProcessingReport,
  saveWorkOrdersToStorage,
  loadWorkOrdersFromStorage,
  createSampleWorkOrders,
  createWorkOrderFromChatMessage,
  autoAssignWorkOrder
}