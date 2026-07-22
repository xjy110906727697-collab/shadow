import Vod20170321, * as $Vod20170321 from '@alicloud/vod20170321'
import * as $OpenApi from '@alicloud/openapi-client'

function createClient(): Vod20170321 {
  const config = new $OpenApi.Config({
    accessKeyId: process.env.VOD_ACCESS_KEY_ID,
    accessKeySecret: process.env.VOD_ACCESS_KEY_SECRET,
    endpoint: `vod.${process.env.VOD_REGION || 'cn-shanghai'}.aliyuncs.com`,
  })
  return new Vod20170321(config)
}

export async function createUploadVideo(params: {
  title: string
  fileName: string
  fileSize?: number
  coverURL?: string
  userData?: string
}) {
  const client = createClient()
  const request = new $Vod20170321.CreateUploadVideoRequest({
    title: params.title,
    fileName: params.fileName,
    fileSize: params.fileSize,
    coverURL: params.coverURL,
    userData: params.userData,
    storageLocation: process.env.VOD_STORAGE_LOCATION,
  })
  return await client.createUploadVideo(request)
}

export async function refreshUploadVideo(videoId: string) {
  const client = createClient()
  const request = new $Vod20170321.RefreshUploadVideoRequest({
    videoId,
  })
  return await client.refreshUploadVideo(request)
}

export async function getPlayInfo(videoId: string) {
  const client = createClient()
  const request = new $Vod20170321.GetPlayInfoRequest({
    videoId,
    formats: 'mp4,m3u8',
    outputType: 'cdn',
  })
  return await client.getPlayInfo(request)
}

export async function deleteVideo(videoId: string) {
  const client = createClient()
  const request = new $Vod20170321.DeleteVideoRequest({
    videoIds: videoId,
  })
  return await client.deleteVideo(request)
}

export async function getVideoInfo(videoId: string) {
  const client = createClient()
  const request = new $Vod20170321.GetVideoInfoRequest({
    videoId,
  })
  return await client.getVideoInfo(request)
}
