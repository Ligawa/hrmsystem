'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Video, Play, Square, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function VideoInterviewPage() {
  const params = useParams()
  const applicationId = params.id as string

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videoData, setVideoData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVideoStatus()
  }, [applicationId])

  const fetchVideoStatus = async () => {
    try {
      const response = await fetch(`/api/video-interviews?applicationId=${applicationId}`)
      const data = await response.json()
      setVideoData(data.interview)
    } catch (err) {
      console.error('[v0] Error fetching video:', err)
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      setLoading(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()

      setIsRecording(true)
      setDuration(0)
      
      // Update timer
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      // Save interval ID for cleanup
      mediaRecorderRef.current.onstart = () => {
        ;(mediaRecorderRef.current as any).intervalId = interval
      }
    } catch (err) {
      setError('Unable to access camera/microphone. Please grant permissions.')
      console.error('[v0] Recording error:', err)
    } finally {
      setLoading(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach((track) => track.stop())

      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Clear interval
      const intervalId = (mediaRecorderRef.current as any).intervalId
      if (intervalId) clearInterval(intervalId)
    }
  }

  const submitVideo = async () => {
    if (recordedChunks.length === 0) {
      setError('No video recorded')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      
      // Convert blob to base64 for transmission
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const response = await fetch('/api/video-interviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applicationId,
              videoBlob: reader.result,
              durationSeconds: duration
            })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Upload failed')
          }

          setSuccess('Video interview submitted successfully!')
          setRecordedChunks([])
          setDuration(0)
          fetchVideoStatus()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Submission failed')
        } finally {
          setSubmitting(false)
        }
      }
      reader.readAsArrayBuffer(blob)
    } catch (err) {
      setError('Failed to process video')
      setSubmitting(false)
    }
  }

  const resetRecording = () => {
    setRecordedChunks([])
    setDuration(0)
    setError('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/careers/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Video Interview</h1>
          <p className="text-muted-foreground">
            Record your response to the interview questions
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Video Status */}
        {videoData && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Video Already Submitted</p>
                  <p className="text-sm text-blue-700">
                    Submitted on {new Date(videoData.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-blue-600">Submitted</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recording Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Record Your Interview</CardTitle>
            <CardDescription>
              You have 5 minutes to record your response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full rounded-lg"
              />
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-mono font-bold">
                {formatTime(duration)}
              </span>
              {isRecording && (
                <span className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={loading}
                  className="gap-2"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="gap-2"
                  size="lg"
                >
                  <Square className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Submit Section */}
            {recordedChunks.length > 0 && !isRecording && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm text-gray-600">
                  Video recorded: {formatTime(duration)}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={resetRecording}
                    variant="outline"
                    className="flex-1"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={submitVideo}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Video'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Ensure you're in a well-lit, quiet environment</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Speak clearly and maintain eye contact with the camera</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Take a moment to think before answering each question</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Maximum 5 minutes of recording time</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>You can retake your response as many times as needed</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
