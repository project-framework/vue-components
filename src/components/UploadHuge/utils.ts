import sparkMD5 from 'spark-md5';
import { http } from '@/utils/http'
import type { UploadProgressEvent } from 'ant-design-vue/lib/vc-upload/interface';

interface Chunk {
    hash: string;
    name: string;
    index: number;
    chunk: Blob;
}

const CHUNK_SIZE = 1024 * 1024 * 10;

// 创建文件hash值
export const calcFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer();
        const reader = new FileReader();
        const size = file.size;
        const offset = 2 * 1024 * 1024;
        // 第一个2M，最后一个区块数据全要
        const chunks = [file.slice(0, offset)];
        let curr = offset;
        while (curr < size) {
            if (curr + offset >= size) {
                // 最后一个区快
                chunks.push(file.slice(curr, curr + offset));
            } else {
                // 中间的区块
                const mid = curr + offset / 2;
                const end = curr + offset;
                chunks.push(file.slice(curr, curr + 2));
                chunks.push(file.slice(mid, mid + 2));
                chunks.push(file.slice(end - 2, end));
            }
            curr += offset;
        }
        // 中间的，取前中后各2各字节
        reader.readAsArrayBuffer(new Blob(chunks));
        reader.onload = (e) => {
            spark.append(e?.target?.result as ArrayBuffer);
            resolve(spark.end());
        };
    });
};

// 创建分片
export const createFileChunk = (file: File, hash: string, size = CHUNK_SIZE) => {
    const chunks = [] as Chunk[];
    let curr = 0;
    let index = 0;
    while (curr < file.size) {
        chunks.push({
            name: `${hash}-${index}.${file.name.substring(file.name.lastIndexOf('.') + 1)}`,
            index,
            hash,
            chunk: file.slice(curr, curr + size),
        });
        curr += size;
        index++;
    }
    return chunks;
};

// 上传分片
export const uploadChunks = async (
    lastSlice = "",
    chunks: Array<Chunk>,
    hash: string,
    ext: string,
    onProgress: (event: UploadProgressEvent) => void,
    onSuccess: () => void
) => {
    // 生成 formData
    const requests = chunks.map((chunk) => {
        const form = new FormData()
        form.append('chunk', chunk.chunk, chunk.name)
        form.append('hash', chunk.hash)
        form.append('name', chunk.name)
        return { form, index: chunk.index, error: 0 }
    })

    let index = lastSlice ? (+lastSlice) + 1 : 0
    const taskPool: Array<Promise<any>> = []
    const max = 6 // 设置浏览器运行最大并发数  目前6个为当前的主流
    let allProgress = index // 总进度

    while (index < requests.length) {
        const task = http.post(
            "/upload",
            {
                data: requests[index].form
            },
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (progress) => {
                    allProgress += (progress.loaded / progress.total!) // 这是单个分片的
                    const percent = ((allProgress / requests.length) * 100)
                    onProgress({ percent })
                },
            }
        )
        task.then(() => {
            taskPool.splice(taskPool.findIndex(item => item === task))
        })
        taskPool.push(task)
        if (taskPool.length === max) {
            // 暂停循环，至少等出一个执行完毕的请求，再执行下一轮循环
            await Promise.race(taskPool);
        }
        index++
    }

    await Promise.all(taskPool)
    await http.post(
        '/mergeFile',
        {
            data: { hash, ext }
        }
    );
    onSuccess()
}
