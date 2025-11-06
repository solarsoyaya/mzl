<template>
  <div 
    :class="[
      'fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 text-gray-900 transition-all duration-300 flex flex-col z-50',
      isCollapsed ? 'w-12' : 'w-64'
    ]"
  >
    <!-- 顶部操作区 -->
    <div class="p-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <!-- 收缩/展开按钮 -->
        <button
          @click="toggleCollapse"
          class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg 
            :class="['w-4 h-4 transition-transform text-gray-600', isCollapsed ? 'rotate-180' : '']"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <!-- 新建对话按钮 - 只在展开状态下显示 -->
        <button
          v-if="!isCollapsed"
          @click="createNewChat"
          class="flex-1 ml-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>新建对话</span>
        </button>
      </div>
    </div>

    <!-- 对话列表 -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="!isCollapsed" class="p-2 space-y-1">
        <div
          v-for="chat in conversations"
          :key="chat.id"
          :class="[
            'group relative p-3 rounded-lg cursor-pointer transition-all duration-200',
            chat.id === activeConversationId 
              ? 'bg-blue-50 border border-blue-200' 
              : 'hover:bg-gray-50'
          ]"
          @click="selectConversation(chat.id)"
        >
          <!-- 对话标题 -->
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium truncate text-gray-900">
                {{ chat.title || '新对话' }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatTime(chat.updatedAt) }}
              </p>
            </div>
            
            <!-- 删除按钮 -->
            <button
              v-if="conversations.length > 1"
              @click.stop="deleteConversation(chat.id)"
              class="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          
          <!-- 最后一条消息预览 -->
          <div v-if="chat.lastMessage" class="mt-2 text-xs text-gray-400 truncate" v-html="chat.lastMessage"></div>
        </div>
      </div>
      
      <!-- 收缩状态下的对话指示器 -->
      <div v-else class="p-2 space-y-2">
        <div
          v-for="chat in conversations"
          :key="chat.id"
          :class="[
            'w-8 h-8 rounded-lg cursor-pointer transition-colors flex items-center justify-center',
            chat.id === activeConversationId 
              ? 'bg-blue-100 border border-blue-300' 
              : 'hover:bg-gray-100'
          ]"
          @click="selectConversation(chat.id)"
          :title="chat.title || '新对话'"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- 底部用户信息 -->
    <div class="p-3 border-t border-gray-200">
      <div v-if="!isCollapsed" class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-sm font-medium text-white">莫</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate text-gray-900">莫智乐</p>
          <p class="text-xs text-gray-500">设备管理系统</p>
        </div>
      </div>
      <div v-else class="flex justify-center">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-sm font-medium text-white">莫export default defineConfig({
  base: './', // 使用相对路径，便于本地直接打开
  plugins: [vue()],
  // ... 其他配置
})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export default {
  name: 'Sidebar',
  props: {
    conversations: {
      type: Array,
      default: () => []
    },
    activeConversationId: {
      type: String,
      default: null
    }
  },
  emits: ['toggle-collapse', 'create-conversation', 'select-conversation', 'delete-conversation'],
  setup(props, { emit }) {
    const isCollapsed = ref(false)

    // 切换收缩状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      emit('toggle-collapse', isCollapsed.value)
    }

    // 创建新对话
    const createNewChat = () => {
      emit('create-conversation')
    }

    // 选择对话
    const selectConversation = (conversationId) => {
      emit('select-conversation', conversationId)
    }

    // 删除对话
    const deleteConversation = (conversationId) => {
      if (props.conversations.length <= 1) return
      
      emit('delete-conversation', conversationId)
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      const now = dayjs()
      const time = dayjs(timestamp)
      
      if (now.diff(time, 'day') === 0) {
        return time.format('HH:mm')
      } else if (now.diff(time, 'day') === 1) {
        return '昨天'
      } else if (now.diff(time, 'day') < 7) {
        return time.format('ddd')
      } else {
        return time.format('MM/DD')
      }
    }

    return {
      isCollapsed,
      toggleCollapse,
      createNewChat,
      selectConversation,
      deleteConversation,
      formatTime
    }
  }
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4B5563;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6B7280;
}
</style>