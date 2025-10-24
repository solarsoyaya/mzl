<template>
  <div class="relative">
    <!-- + 号按钮 -->
    <button
      @click="toggleMenu"
      :class="[
        'w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center',
        'border border-gray-300 hover:border-gray-400',
        isOpen ? 'rotate-45' : ''
      ]"
      :disabled="isAIResponding"
      style="height: 48px; width: 48px;"
    >
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>

    <!-- 功能菜单 -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      >
        <!-- 文件上传 -->
        <div class="px-3 py-1">
          <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-3 transition-colors min-h-[56px]">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 leading-tight">上传文件</div>
              <div class="text-xs text-gray-500 leading-tight mt-0.5">上传设备台账或相关文档</div>
            </div>
            <input
              type="file"
              class="hidden"
              accept=".xlsx,.xls,.pdf,.doc,.docx"
              @change="handleFileUpload"
            />
          </label>
        </div>

        <div class="border-t border-gray-100 my-1"></div>

        <!-- 下载模板 -->
        <button
          @click="handleDownloadTemplate('maintenance')"
          class="w-full flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 leading-tight">下载保养计划模板</div>
            <div class="text-xs text-gray-500 leading-tight mt-0.5">获取标准设备保养计划表</div>
          </div>
        </button>

        <button
          @click="handleDownloadTemplate('report')"
          class="w-full flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 leading-tight">下载汇报模板</div>
            <div class="text-xs text-gray-500 leading-tight mt-0.5">获取工作汇报表格模板</div>
          </div>
        </button>

        <div class="border-t border-gray-100 my-1"></div>

        <!-- 一键汇报 -->
        <button
          @click="handleOneClickReport"
          class="w-full flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 leading-tight">一键汇报</div>
            <div class="text-xs text-gray-500 leading-tight mt-0.5">快速上报紧急事件</div>
          </div>
        </button>

        <!-- 生成汇报 -->
        <button
          @click="handleGenerateReport"
          class="w-full flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 leading-tight">生成工作汇报</div>
            <div class="text-xs text-gray-500 leading-tight mt-0.5">基于对话内容生成汇报</div>
          </div>
        </button>

        <div class="border-t border-gray-100 my-1"></div>

        <!-- 紧急联系 -->
        <button
          @click="handleEmergencyContact"
          class="w-full flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 leading-tight">紧急联系</div>
            <div class="text-xs text-gray-500 leading-tight mt-0.5">查看紧急联系电话</div>
          </div>
        </button>

        <!-- 清空对话 -->
        <button
          @click="handleClearChat"
          class="w-full flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[56px]"
        >
          <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <div class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 leading-tight">清空对话</div>
            <div class="text-xs text-gray-500 leading-tight mt-0.5">清除所有聊天记录</div>
          </div>
        </button>
      </div>
    </transition>

    <!-- 点击外部关闭菜单 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PlusMenu',
  props: {
    isAIResponding: {
      type: Boolean,
      default: false
    }
  },
  emits: ['file-upload', 'generate-report', 'clear-chat', 'one-click-report', 'show-notification'],
  setup(props, { emit }) {
    const isOpen = ref(false)

    const toggleMenu = () => {
      if (props.isAIResponding) return
      isOpen.value = !isOpen.value
    }

    const closeMenu = () => {
      isOpen.value = false
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        emit('file-upload', file)
        closeMenu()
        // 重置文件输入
        event.target.value = ''
      }
    }

    const handleDownloadTemplate = (type) => {
      // 模拟下载模板文件
      const templates = {
        maintenance: {
          filename: '设备保养计划模板.xlsx',
          data: [
            ['设备编号', '设备名称', '保养类型', '保养周期', '负责人', '下次保养时间'],
            ['EQ001', 'CT扫描仪', '日常保养', '每周', '张三', '2024-01-15'],
            ['EQ002', '呼吸机', '深度保养', '每月', '李四', '2024-01-20'],
            ['EQ003', '心电监护仪', '日常保养', '每周', '王五', '2024-01-18']
          ]
        },
        report: {
          filename: '工作汇报模板.xlsx',
          data: [
            ['日期', '工作内容', '完成情况', '存在问题', '下步计划'],
            ['2024-01-10', '设备巡检', '已完成', '无', '继续按计划执行'],
            ['2024-01-11', '故障处理', '已完成', '备件不足', '及时补充备件'],
            ['2024-01-12', '保养计划制定', '进行中', '需要更多数据', '收集历史数据']
          ]
        }
      }

      const template = templates[type]
      if (template) {
        downloadCSV(template.data, template.filename)
      }
      closeMenu()
    }

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

    const handleGenerateReport = () => {
      console.log('生成工作汇报按钮被点击')
      try {
        emit('generate-report')
        console.log('generate-report 事件已发送')
        closeMenu()
      } catch (error) {
        console.error('生成工作汇报时出错:', error)
      }
    }

    const handleOneClickReport = () => {
      try {
        emit('one-click-report')
        closeMenu()
      } catch (error) {
        console.error('一键汇报时出错:', error)
      }
    }

    const handleClearChat = () => {
      emit('clear-chat')
      closeMenu()
    }

    const handleEmergencyContact = () => {
      // 显示紧急联系信息
      emit('show-notification', {
        type: 'info',
        title: '紧急联系电话',
        message: '工程部：123-456-7890\n保洁部：123-456-7891\n安保部：123-456-7892',
        confirmText: '知道了',
        autoClose: false
      })
      closeMenu()
    }

    return {
      isOpen,
      toggleMenu,
      closeMenu,
      handleFileUpload,
      handleDownloadTemplate,
      handleGenerateReport,
      handleOneClickReport,
      handleEmergencyContact,
      handleClearChat
    }
  }
}
</script>