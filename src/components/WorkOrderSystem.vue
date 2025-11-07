<template>
  <div class="h-screen bg-gray-50 flex">
    <!-- 左侧功能导航栏 -->
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- 快捷搜索框 -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索工单编号、客户名称、处理组..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- 功能导航菜单 -->
      <nav class="flex-1 p-4 space-y-2">
        <button
          v-for="item in navigationItems"
          :key="item.id"
          @click="currentView = item.id"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentView === item.id
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          ]"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <component :is="item.icon" class="w-5 h-5" />
          </div>
          <span>{{ item.name }}</span>
          <span v-if="item.count > 0" class="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            {{ item.count }}
          </span>
        </button>
      </nav>

      <!-- 统计分析入口 -->
      <div class="p-4 border-t border-gray-200">
        <button
          @click="currentView = 'analytics'"
          :class="[
            'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentView === 'analytics'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span>统计分析</span>
        </button>
      </div>
    </div>

    <!-- 中间工单列表区 -->
    <div class="flex-1 bg-white border-r border-gray-200 flex flex-col">
      <!-- 列表头部 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">{{ getCurrentViewTitle() }}</h2>
        <div class="flex items-center space-x-2">
          <!-- 创建新工单按钮 -->
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            创建新工单
          </button>
          
          <!-- 智能体查询 -->
          <button
            @click="queryWorkOrders"
            class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            智能查询
          </button>

          <!-- 状态筛选 -->
          <select
            v-model="statusFilter"
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="overtime">已超时</option>
          </select>

          <!-- 处理组筛选 -->
          <select
            v-model="groupFilter"
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部处理组</option>
            <option value="设备维修组">设备维修组</option>
            <option value="客服咨询组">客服咨询组</option>
            <option value="综合维修组">综合维修组</option>
          </select>
        </div>
      </div>

      <!-- 工单表格 -->
      <div class="flex-1 overflow-auto">
        <table class="w-full">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工单编号</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户信息</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">处理组</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时限倒计时</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="workOrder in filteredWorkOrders"
              :key="workOrder.id"
              @click="selectWorkOrder(workOrder)"
              :class="[
                'hover:bg-gray-50 cursor-pointer',
                selectedWorkOrder?.id === workOrder.id ? 'bg-blue-50' : ''
              ]"
            >
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ workOrder.id }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ workOrder.customerName }}</div>
                <div class="text-sm text-gray-500">{{ workOrder.customerPhone }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ workOrder.problemType }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ workOrder.processingGroup }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <CountdownTimer
                  :deadline="workOrder.deadline"
                  :status="workOrder.status"
                  @timeout="handleTimeout(workOrder.id)"
                />
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <StatusTag :status="workOrder.status" />
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button
                    @click.stop="viewDetails(workOrder)"
                    class="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    查看详情
                  </button>
                  <button
                    @click.stop="addProgress(workOrder)"
                    class="text-green-600 hover:text-green-800 font-medium"
                  >
                    进度备注
                  </button>
                  <button
                    v-if="workOrder.status !== 'completed'"
                    @click.stop="urgentProcess(workOrder)"
                    class="text-red-600 hover:text-red-800 font-medium"
                  >
                    加急处理
                  </button>
                  <button
                    @click.stop="confirmDelete(workOrder)"
                    class="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="p-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          显示 {{ startIndex + 1 }} - {{ endIndex }} 条，共 {{ filteredWorkOrders.length }} 条
        </div>
        <div class="flex space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧工单详情区 -->
    <div class="w-96 bg-white flex flex-col" v-if="selectedWorkOrder">
      <!-- 详情头部 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">工单详情</h3>
        <div class="flex space-x-2">
          <button
            @click="closeDetails"
            class="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            关闭详情
          </button>
        </div>
      </div>

      <!-- 工单基本信息模块 -->
      <div class="p-4 border-b border-gray-200">
        <h4 class="text-md font-medium text-gray-900 mb-3">基本信息</h4>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-500">工单编号</label>
            <div class="text-sm text-gray-900">{{ selectedWorkOrder.id }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">创建时间</label>
            <div class="text-sm text-gray-900">{{ formatDate(selectedWorkOrder.createdAt) }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">客户信息</label>
            <div class="text-sm text-gray-900">{{ selectedWorkOrder.customerName }}</div>
            <div class="text-sm text-gray-500">{{ selectedWorkOrder.customerPhone }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">问题描述</label>
            <div class="text-sm text-gray-900 bg-gray-50 p-2 rounded">{{ selectedWorkOrder.description }}</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">时限规则</label>
            <div class="text-sm text-blue-600 font-medium">要求24小时内处理完毕</div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">当前倒计时</label>
            <div class="text-lg font-bold" :class="getCountdownColor(selectedWorkOrder)">
              <CountdownTimer
                :deadline="selectedWorkOrder.deadline"
                :status="selectedWorkOrder.status"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 处理进度模块 -->
      <div class="p-4 border-b border-gray-200 flex-1 overflow-auto">
        <h4 class="text-md font-medium text-gray-900 mb-3">处理进度</h4>
        <div class="space-y-4">
          <div
            v-for="(record, index) in selectedWorkOrder.processingRecords"
            :key="index"
            class="flex space-x-3"
          >
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ record.action }}</div>
              <div class="text-sm text-gray-500">{{ record.description }}</div>
              <div class="text-xs text-gray-400 mt-1">
                {{ record.handler }} · {{ formatDate(record.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 沟通协作模块 -->
      <div class="p-4 border-t border-gray-200">
        <h4 class="text-md font-medium text-gray-900 mb-3">沟通协作</h4>
        <div class="space-y-3">
          <div class="bg-gray-50 rounded-lg p-3">
            <textarea
              v-model="newComment"
              placeholder="添加处理备注..."
              class="w-full resize-none border-0 bg-transparent text-sm focus:outline-none"
              rows="3"
            ></textarea>
          </div>
          <div class="flex justify-between items-center">
            <button
              @click="addComment"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加备注
            </button>
            <button
              v-if="selectedWorkOrder.status !== 'completed'"
              @click="completeWorkOrder"
              class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              完成工单
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center bg-white">
      <div class="text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">选择一个工单</h3>
        <p class="text-gray-500">点击左侧列表中的工单查看详细信息</p>
      </div>
    </div>

    <!-- 创建新工单模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">创建新工单</h3>
          <button
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">客户姓名</label>
            <input
              v-model="newWorkOrder.customerName"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户姓名"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
            <input
              v-model="newWorkOrder.customerPhone"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入联系电话"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">问题类型</label>
            <select
              v-model="newWorkOrder.problemType"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择问题类型</option>
              <option value="设备故障">设备故障</option>
              <option value="网络问题">网络问题</option>
              <option value="软件故障">软件故障</option>
              <option value="硬件维修">硬件维修</option>
              <option value="咨询求助">咨询求助</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">处理组</label>
            <select
              v-model="newWorkOrder.processingGroup"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择处理组</option>
              <option value="设备维修组">设备维修组</option>
              <option value="客服咨询组">客服咨询组</option>
              <option value="综合维修组">综合维修组</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">问题描述</label>
            <textarea
              v-model="newWorkOrder.description"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请详细描述问题"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="createWorkOrder"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建工单
          </button>
        </div>
      </div>
    </div>

    <!-- 智能体查询结果模态框 -->
    <teleport to="body">
      <div v-if="showQueryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000]">
        <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">智能查询结果</h3>
            <button
              @click="showQueryModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-2">工单统计</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="text-blue-600 font-semibold">{{ workOrderStats.total }}</div>
                  <div class="text-blue-700">总工单数</div>
                </div>
                <div>
                  <div class="text-yellow-600 font-semibold">{{ workOrderStats.pending }}</div>
                  <div class="text-yellow-700">待处理</div>
                </div>
                <div>
                  <div class="text-blue-600 font-semibold">{{ workOrderStats.processing }}</div>
                  <div class="text-blue-700">处理中</div>
                </div>
                <div>
                  <div class="text-green-600 font-semibold">{{ workOrderStats.completed }}</div>
                  <div class="text-green-700">已完成</div>
                </div>
              </div>
            </div>
            
            <div v-if="workOrderStats.overtime > 0" class="bg-red-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-red-900 mb-2">⚠️ 超时提醒</h4>
              <p class="text-sm text-red-700">有 {{ workOrderStats.overtime }} 个工单已超时，请及时处理！</p>
            </div>
            
            <div v-if="recentWorkOrders.length > 0" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-2">最近工单</h4>
              <div class="space-y-2">
                <div v-for="order in recentWorkOrders" :key="order.id" class="text-sm">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">{{ order.id }}</span>
                    <StatusTag :status="order.status" />
                  </div>
                  <div class="text-gray-600">{{ order.customerName }} - {{ order.problemType }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button
              @click="showQueryModal = false"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 创建成功自定义弹窗 -->
    <teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000]">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">工单创建成功</h3>
            <button @click="closeSuccessModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm text-gray-700">
            <div>工单编号：<span class="font-medium">{{ createdWorkOrder?.id }}</span></div>
            <div>处理组：<span class="font-medium">{{ createdWorkOrder?.processingGroup }}</span></div>
            <div class="flex items-center gap-2">状态：<StatusTag :status="createdWorkOrder?.status" /></div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="closeSuccessModal" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">知道了</button>
            <button @click="viewCreatedWorkOrder" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">查看详情</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 删除确认弹窗 -->
    <teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000]">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">确认删除</h3>
            <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-700">确定删除工单 <span class="font-medium">{{ workOrderToDelete?.id }}</span>？此操作不可恢复。</p>
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="closeDeleteModal" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
            <button @click="deleteWorkOrder" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">删除</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
  <!-- 表单校验错误弹窗 -->
  <teleport to="body">
    <div v-if="showErrorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000]">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-red-600">表单校验错误</h3>
          <button @click="showErrorModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-700">{{ errorMessage }}</p>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showErrorModal = false" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">知道了</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import CountdownTimer from './CountdownTimer.vue'
import StatusTag from './StatusTag.vue'

export default {
  name: 'WorkOrderSystem',
  components: {
    CountdownTimer,
    StatusTag
  },
  props: {
    workOrders: {
      type: Array,
      default: () => []
    }
  },
  emits: ['work-order-updated', 'timeout-notification', 'work-order-deleted'],
  setup(props, { emit }) {
    // 状态管理
    const currentView = ref('overview')
    const searchText = ref('')
    const statusFilter = ref('')
    const groupFilter = ref('')
    const selectedWorkOrder = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const newComment = ref('')
    
    // 新增状态
    const showCreateModal = ref(false)
    const showQueryModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')
    const newWorkOrder = ref({
      customerName: '',
      customerPhone: '',
      problemType: '',
      processingGroup: '',
      description: ''
    })
    
    // 成功提示与删除确认弹窗状态
    const showSuccessModal = ref(false)
    const createdWorkOrder = ref(null)
    const showDeleteModal = ref(false)
    const workOrderToDelete = ref(null)

    // 导航项
    const navigationItems = computed(() => [
      {
        id: 'overview',
        name: '工单概览',
        icon: 'ChartBarIcon',
        count: 0
      },
      {
        id: 'pending',
        name: '待处理工单',
        icon: 'ClockIcon',
        count: pendingCount.value
      },
      {
        id: 'processing',
        name: '处理中工单',
        icon: 'CogIcon',
        count: processingCount.value
      },
      {
        id: 'completed',
        name: '已完成工单',
        icon: 'CheckCircleIcon',
        count: completedCount.value
      }
    ])

    // 统计计算
    const pendingCount = computed(() => 
      props.workOrders.filter(order => order.status === 'pending').length
    )
    const processingCount = computed(() => 
      props.workOrders.filter(order => order.status === 'processing').length
    )
    const completedCount = computed(() => 
      props.workOrders.filter(order => order.status === 'completed').length
    )
    
    // 新增统计计算
    const workOrderStats = computed(() => ({
      total: props.workOrders.length,
      pending: pendingCount.value,
      processing: processingCount.value,
      completed: completedCount.value,
      overtime: props.workOrders.filter(order => order.status === 'overtime').length
    }))
    
    const recentWorkOrders = computed(() => 
      props.workOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    )

    // 筛选逻辑
    const filteredWorkOrders = computed(() => {
      let filtered = props.workOrders

      // 视图筛选
      if (currentView.value !== 'overview') {
        filtered = filtered.filter(order => order.status === currentView.value)
      }

      // 状态筛选
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.status === statusFilter.value)
      }

      // 处理组筛选
      if (groupFilter.value) {
        filtered = filtered.filter(order => order.processingGroup === groupFilter.value)
      }

      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.id.toLowerCase().includes(search) ||
          order.customerName.toLowerCase().includes(search) ||
          order.processingGroup.toLowerCase().includes(search)
        )
      }

      return filtered
    })

    // 分页计算
    const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
    const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredWorkOrders.value.length))
    const totalPages = computed(() => Math.ceil(filteredWorkOrders.value.length / pageSize.value))

    // 方法
    const getCurrentViewTitle = () => {
      const item = navigationItems.value.find(item => item.id === currentView.value)
      return item ? item.name : '工单管理'
    }

    const selectWorkOrder = (workOrder) => {
      selectedWorkOrder.value = workOrder
    }

    const closeDetails = () => {
      selectedWorkOrder.value = null
    }

    const viewDetails = (workOrder) => {
      selectedWorkOrder.value = workOrder
    }

    const addProgress = (workOrder) => {
      // 添加进度备注逻辑
      console.log('添加进度备注:', workOrder.id)
    }

    const urgentProcess = (workOrder) => {
      // 加急处理逻辑
      console.log('加急处理:', workOrder.id)
    }

    const addComment = () => {
      if (!newComment.value.trim() || !selectedWorkOrder.value) return
      
      const comment = {
        id: Date.now().toString(),
        workOrderId: selectedWorkOrder.value.id,
        action: '添加备注',
        description: newComment.value.trim(),
        handler: '当前用户',
        timestamp: new Date()
      }

      if (!selectedWorkOrder.value.processingRecords) {
        selectedWorkOrder.value.processingRecords = []
      }
      selectedWorkOrder.value.processingRecords.push(comment)
      
      newComment.value = ''
      emit('work-order-updated', selectedWorkOrder.value)
    }

    const completeWorkOrder = () => {
      if (!selectedWorkOrder.value) return
      
      selectedWorkOrder.value.status = 'completed'
      selectedWorkOrder.value.completedAt = new Date()
      
      const completionRecord = {
        id: Date.now().toString(),
        workOrderId: selectedWorkOrder.value.id,
        action: '完成工单',
        description: '工单已处理完成',
        handler: '当前用户',
        timestamp: new Date()
      }

      if (!selectedWorkOrder.value.processingRecords) {
        selectedWorkOrder.value.processingRecords = []
      }
      selectedWorkOrder.value.processingRecords.push(completionRecord)
      
      emit('work-order-updated', selectedWorkOrder.value)
    }

    const handleTimeout = (workOrderId) => {
      emit('timeout-notification', workOrderId)
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString('zh-CN')
    }

    const getCountdownColor = (workOrder) => {
      const now = new Date()
      const deadline = new Date(workOrder.deadline)
      const timeDiff = deadline - now
      const hours = timeDiff / (1000 * 60 * 60)
      
      if (hours < 0) return 'text-red-600'
      if (hours < 0.5) return 'text-orange-600'
      return 'text-green-600'
    }

    // 创建新工单
    const createWorkOrder = () => {
      if (!newWorkOrder.value.customerName || !newWorkOrder.value.customerPhone || 
          !newWorkOrder.value.problemType || !newWorkOrder.value.processingGroup || 
          !newWorkOrder.value.description) {
        errorMessage.value = '请填写完整的工单信息'
        showErrorModal.value = true
        return
      }
      
      const workOrder = {
        id: 'WO' + Date.now().toString().slice(-6),
        customerName: newWorkOrder.value.customerName,
        customerPhone: newWorkOrder.value.customerPhone,
        problemType: newWorkOrder.value.problemType,
        processingGroup: newWorkOrder.value.processingGroup,
        description: newWorkOrder.value.description,
        status: 'pending',
        createdAt: new Date(),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后
        processingRecords: [{
          id: Date.now().toString(),
          action: '创建工单',
          description: '工单已创建，等待处理',
          handler: '系统管理员',
          timestamp: new Date()
        }]
      }
      
      // 添加到工单列表
      props.workOrders.unshift(workOrder)
      
      // 重置表单
      newWorkOrder.value = {
        customerName: '',
        customerPhone: '',
        problemType: '',
        processingGroup: '',
        description: ''
      }
      
      showCreateModal.value = false
      // 弹出自定义成功提示并缓存创建的工单信息
      createdWorkOrder.value = workOrder
      showSuccessModal.value = true
      // 同步详情面板选中刚创建的工单
      selectedWorkOrder.value = workOrder
      // 通知外部工单已更新
      emit('work-order-updated', workOrder)
    }

    // 智能查询
    const queryWorkOrders = () => {
      showQueryModal.value = true
    }

    // 删除相关方法
    const confirmDelete = (workOrder) => {
      workOrderToDelete.value = workOrder
      showDeleteModal.value = true
    }
    const deleteWorkOrder = () => {
      if (!workOrderToDelete.value) return
      const id = workOrderToDelete.value.id
      const index = props.workOrders.findIndex(o => o.id === id)
      if (index !== -1) props.workOrders.splice(index, 1)
      if (selectedWorkOrder.value?.id === id) selectedWorkOrder.value = null
      emit('work-order-deleted', id)
      showDeleteModal.value = false
      workOrderToDelete.value = null
    }
    const closeDeleteModal = () => {
      showDeleteModal.value = false
      workOrderToDelete.value = null
    }
    const closeSuccessModal = () => {
      showSuccessModal.value = false
      createdWorkOrder.value = null
    }
    const viewCreatedWorkOrder = () => {
      if (createdWorkOrder.value) {
        selectWorkOrder(createdWorkOrder.value)
        closeSuccessModal()
      }
    }

    // 监听数据变化
    watch(() => props.workOrders, () => {
      // 数据更新时刷新当前视图
      console.log('工单数据已更新')
    }, { deep: true })

    // 图标组件
    const ChartBarIcon = {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      `
    }

    const ClockIcon = {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `
    }

    const CogIcon = {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      `
    }

    const CheckCircleIcon = {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `
    }



    return {
      currentView,
      searchText,
      statusFilter,
      groupFilter,
      selectedWorkOrder,
      currentPage,
      pageSize,
      newComment,
      // 新增状态
      showCreateModal,
      showQueryModal,
      newWorkOrder,
      workOrderStats,
      recentWorkOrders,
      navigationItems,
      filteredWorkOrders,
      startIndex,
      endIndex,
      totalPages,
      getCurrentViewTitle,
      selectWorkOrder,
      closeDetails,
      viewDetails,
      addProgress,
      urgentProcess,
      addComment,
      completeWorkOrder,
      handleTimeout,
      formatDate,
      getCountdownColor,
      // 新增函数
      createWorkOrder,
      queryWorkOrders,
      ChartBarIcon,
      ClockIcon,
      CogIcon,
      CheckCircleIcon,
       // 弹窗与删除方法绑定
       showSuccessModal,
       createdWorkOrder,
       showDeleteModal,
       workOrderToDelete,
       confirmDelete,
       deleteWorkOrder,
       closeDeleteModal,
       closeSuccessModal,
       viewCreatedWorkOrder
     }
   }
 }
 </script>
 
 <style scoped>
 /* 自定义滚动条 */
 .overflow-auto::-webkit-scrollbar {
   width: 6px;
   height: 6px;
 }
 
 .overflow-auto::-webkit-scrollbar-track {
   background: #f1f1f1;
   border-radius: 3px;
 }
 
 .overflow-auto::-webkit-scrollbar-thumb {
   background: #c1c1c1;
   border-radius: 3px;
 }
 
 .overflow-auto::-webkit-scrollbar-thumb:hover {
   background: #a8a8a8;
 }
 
 /* 表格样式 */
 table {
   border-collapse: separate;
   border-spacing: 0;
 }
 
 th {
   position: sticky;
   top: 0;
   background: #f9fafb;
   z-index: 10;
 }
 
 /* 动画效果 */
 tr {
   transition: background-color 0.2s ease;
 }
 
 tr:hover {
   background-color: #f9fafb;
 }
 
 /* 闪烁效果 */
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
 </style>