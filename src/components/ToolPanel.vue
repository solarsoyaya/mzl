<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
    <!-- 工具面板标题 -->
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">智能工具</h3>
      <p class="text-sm text-gray-600 mt-1">快捷指令和文件处理</p>
    </div>
    
    <!-- 工具内容 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- 快捷指令区域 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          快捷指令
        </h4>
        
        <!-- 分组显示快捷指令 -->
        <div class="space-y-2">
          <div
            v-for="group in commandGroups"
            :key="group.category"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <!-- 分组标题 -->
            <button
              @click="toggleGroup(group.category)"
              class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center space-x-2">
                <span class="text-lg">{{ group.icon }}</span>
                <span class="text-sm font-medium text-gray-900">{{ group.title }}</span>
                <span class="text-xs text-gray-500">({{ group.commands.length }})</span>
              </div>
              <svg
                :class="[
                  'w-4 h-4 text-gray-500 transition-transform duration-200',
                  expandedGroup === group.category ? 'rotate-180' : ''
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- 分组内容 -->
            <div
              v-if="expandedGroup === group.category"
              class="border-t border-gray-200"
            >
              <button
                v-for="command in group.commands"
                :key="command.id"
                @click="executeQuickCommand(command)"
                :disabled="isAiResponding"
                :class="[
                  'w-full text-left p-3 transition-all duration-200 group border-b border-gray-100 last:border-b-0',
                  isAiResponding 
                    ? 'bg-gray-50 cursor-not-allowed opacity-50 pointer-events-none'
                    : 'hover:bg-primary-50'
                ]"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <span class="text-primary-600 text-xs">{{ command.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div :class="[
                      'text-sm font-medium',
                      isAiResponding 
                        ? 'text-gray-400' 
                        : 'text-gray-900 group-hover:text-primary-700'
                    ]">
                      {{ command.title }}
                    </div>
                    <div :class="[
                      'text-xs mt-1 line-clamp-1',
                      isAiResponding ? 'text-gray-300' : 'text-gray-500'
                    ]">
                      {{ command.description }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 文件处理区域 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          文件处理
        </h4>
        
        <!-- 文件上传区域 -->
        <div 
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          :class="[
              'border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200',
              isAiResponding 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50 pointer-events-none'
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
            ]"
          @click="!isAiResponding && triggerFileUpload()"
        >
          <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p :class="[
            'text-sm',
            isAiResponding ? 'text-gray-400' : 'text-gray-600'
          ]">
            <span :class="[
              'font-medium',
              isAiResponding ? 'text-gray-400' : 'text-primary-600'
            ]">
              {{ isAiResponding ? 'AI正在回答中...' : '点击上传' }}
            </span>
            {{ isAiResponding ? '' : ' 或拖拽文件到此处' }}
          </p>
          <p :class="[
            'text-xs mt-1',
            isAiResponding ? 'text-gray-300' : 'text-gray-500'
          ]">
            {{ isAiResponding ? '请等待AI回答完成' : '支持 Excel (.xlsx, .xls) 和 CSV 文件' }}
          </p>
        </div>
        
        <!-- 隐藏的文件输入 -->
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="handleFileSelect"
          class="hidden"
        />
        
        <!-- 文件处理功能按钮 -->
        <div class="mt-4 space-y-2">
          <button
            @click="downloadTemplate('maintenance')"
            class="w-full flex items-center justify-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            下载保养计划模板
          </button>
          
          <button
            @click="downloadTemplate('report')"
            class="w-full flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z"></path>
            </svg>
            下载汇报模板
          </button>
        </div>
      </div>
      
      <!-- 汇报生成区域 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          智能汇报
        </h4>
        
        <button
          @click="generateReport"
          class="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-200 shadow-sm"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          生成工作汇报
        </button>
        
        <p class="text-xs text-gray-500 mt-2 text-center">
          基于当前对话自动生成汇报内容
        </p>
      </div>
      
      <!-- 联系人快速拨号 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          紧急联系
        </h4>
        
        <div class="space-y-2">
          <div
            v-for="contact in emergencyContacts"
            :key="contact.id"
            class="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ contact.name }} {{ contact.person }}</div>
              <div class="text-xs text-gray-500">{{ contact.department }}</div>
            </div>
            <button
              @click="callContact(contact)"
              class="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 transition-colors"
              :title="`拨打 ${contact.phone}`"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { quickCommands, contacts, excelTemplates } from '../data/mockData.js'

export default {
  name: 'ToolPanel',
  props: {
    activeTab: {
      type: String,
      default: 'equipment'
    },
    isAiResponding: {
      type: Boolean,
      default: false
    }
  },
  emits: ['quick-command', 'file-upload', 'generate-report', 'show-notification'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    const expandedGroup = ref(null)
    
    // 显示所有快捷指令
    const quickCommandsToShow = computed(() => {
      console.log('quickCommands from mockData:', quickCommands)
      console.log('quickCommands length:', quickCommands.length)
      console.log('quickCommands first item:', quickCommands[0])
      return quickCommands
    })
    
    // 按类别分组快捷指令
    const commandGroups = computed(() => {
      const groups = [
        {
          category: 'emergency',
          title: '急救指南',
          icon: '🚑',
          commands: quickCommands.filter(cmd => cmd.category === 'emergency')
        },
        {
          category: 'equipment',
          title: '设备故障',
          icon: '⚙️',
          commands: quickCommands.filter(cmd => cmd.category === 'equipment')
        },
        {
          category: 'management',
          title: '管理流程',
          icon: '📋',
          commands: quickCommands.filter(cmd => cmd.category === 'management')
        }
      ]
      return groups.filter(group => group.commands.length > 0)
    })
    
    // 切换分组展开状态
    const toggleGroup = (category) => {
      expandedGroup.value = expandedGroup.value === category ? null : category
    }
    
    // 紧急联系人
    const emergencyContacts = computed(() => {
      // 合并所有联系人并添加紧急标识
      const allContacts = [
        ...contacts.management.map(contact => ({ ...contact, isEmergency: true })),
        ...contacts.onDuty.map(contact => ({ ...contact, isEmergency: true }))
      ]
      return allContacts.slice(0, 5) // 只显示前5个联系人
    })

    // 执行快捷指令
    const executeQuickCommand = (command) => {
      // 防重复点击：如果AI正在响应，直接返回
      if (props.isAiResponding) {
        return
      }
      
      emit('quick-command', command)
    }

    // 触发文件上传
    const triggerFileUpload = () => {
      if (!props.isAiResponding) {
        fileInput.value?.click()
      }
    }

    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        emit('file-upload', file)
        event.target.value = ''
      }
    }

    // 处理拖拽上传
    const handleDrop = (event) => {
      event.preventDefault()
      if (!props.isAiResponding) {
        const files = event.dataTransfer.files
        if (files.length > 0) {
          emit('file-upload', files[0])
        }
      }
    }

    // 下载模板
    const downloadTemplate = (type) => {
      const template = excelTemplates[type]
      if (template) {
        downloadExcel(template.data, template.filename)
      }
    }

    // 生成汇报
    const generateReport = () => {
      emit('generate-report')
    }

    // 联系人拨号
    const callContact = (contact) => {
      // 模拟拨号功能
      emit('show-notification', {
        type: 'info',
        title: '拨打电话',
        message: `正在拨打 ${contact.name} (${contact.phone})`,
        confirmText: '知道了',
        autoClose: true,
        autoCloseDelay: 2000
      })
    }

    // Excel下载功能
    const downloadExcel = (data, filename) => {
      const csvContent = data.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')
      
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename.replace('.xlsx', '.csv'))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      fileInput,
      quickCommands: quickCommandsToShow,
      quickCommandsToShow,
      commandGroups,
      expandedGroup,
      emergencyContacts,
      executeQuickCommand,
      triggerFileUpload,
      handleFileSelect,
      handleDrop,
      downloadTemplate,
      generateReport,
      callContact,
      toggleGroup
    }
  }
}
</script>

<style scoped>
/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>