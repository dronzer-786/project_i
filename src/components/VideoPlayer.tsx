interface VideoPlayerProps {
  src: string
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <video src={src} controls className="w-full h-full">
      Your browser does not support the video tag.
    </video>
  )
}

