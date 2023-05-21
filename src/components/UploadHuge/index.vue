<script setup lang="ts">
import { ref, reactive } from 'vue'
import {calcFileHash, createFileChunk, uploadChunks } from './utils'
import { message, type UploadProps } from 'ant-design-vue'
import { http } from '@/utils/http'
import type { UploadListProgressProps, UploadChangeParam } from 'ant-design-vue/lib/upload/interface'
import type { UploadRequestOption, UploadProgressEvent } from 'ant-design-vue/lib/vc-upload/interface'

interface UploadResponse {
  uploaded: boolean,
  url: string,
  lastSlice: string
}

const fileList = ref<UploadProps["fileList"]>([])
const progress = reactive<UploadListProgressProps>({
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068',
  },
  strokeWidth: 3,
  format: percent => `${parseFloat((percent || 0).toFixed(2))}%`,
})

const handleChange = (info: UploadChangeParam) => {
  fileList.value = [...info.fileList]
};

const upload = async (params: UploadRequestOption<File>) => {
    if (params.file) {
        const file = params.file as File;

        // 1. 生成 hash
        const hash = await calcFileHash(file);

        // 2. 校验文件是否已存在
        const data = await http.post<UploadResponse>("/checkFile", { data: { hash } });
        if (data.uploaded) {
            message.success("秒传文件成功")
            params.onSuccess && params.onSuccess(file)
            return
        }

        // 3. 切片
        const chunks = createFileChunk(file, hash);

        // 4. 上传切片
        uploadChunks(
            data.lastSlice, // 上一次的分片，支持断点续传
            chunks,
            hash,
            file.name.substring(file.name.lastIndexOf(".") + 1),
            params.onProgress as (event: UploadProgressEvent) => void,
            params.onSuccess as () => void
        )

    }
}

</script>

<template>
  <a-upload
    v-model:file-list="fileList"
    :customRequest="upload"
    :progress="progress"
    @change="handleChange"
  >
    <a-button>大文件上传</a-button>
  </a-upload>
</template>

<style scoped></style>
