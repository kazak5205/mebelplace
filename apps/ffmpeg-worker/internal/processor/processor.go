package processor

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

// VideoProcessor обрабатывает видео с помощью FFmpeg
type VideoProcessor struct {
	ffmpegPath      string
	segmentsDir     string
	segmentDuration int
}

// ProcessingJob задача обработки видео
type ProcessingJob struct {
	VideoID         string `json:"video_id"`
	InputPath       string `json:"input_path"`
	OutputDir       string `json:"output_dir"`
	Quality         string `json:"quality"`
	SegmentDuration int    `json:"segment_duration"`
}

// ProcessingResult результат обработки
type ProcessingResult struct {
	VideoID       string   `json:"video_id"`
	PlaylistPath  string   `json:"playlist_path"`
	SegmentPaths  []string `json:"segment_paths"`
	ThumbnailPath string   `json:"thumbnail_path"`
	Duration      float64  `json:"duration"`
	Success       bool     `json:"success"`
	Error         string   `json:"error,omitempty"`
}

// NewVideoProcessor создает новый процессор видео
func NewVideoProcessor(segmentsDir string, segmentDuration int) *VideoProcessor {
	return &VideoProcessor{
		ffmpegPath:      "ffmpeg",
		segmentsDir:     segmentsDir,
		segmentDuration: segmentDuration,
	}
}

// ProcessVideo обрабатывает видео в HLS формат
func (p *VideoProcessor) ProcessVideo(ctx context.Context, job *ProcessingJob) (*ProcessingResult, error) {
	result := &ProcessingResult{
		VideoID: job.VideoID,
		Success: false,
	}

	// Создаем выходную директорию
	outputDir := filepath.Join(p.segmentsDir, job.VideoID)
	err := os.MkdirAll(outputDir, 0755)
	if err != nil {
		result.Error = fmt.Sprintf("failed to create output directory: %v", err)
		return result, err
	}

	// Генерируем thumbnail
	thumbnailPath := filepath.Join(outputDir, "thumbnail.jpg")
	err = p.generateThumbnail(ctx, job.InputPath, thumbnailPath)
	if err != nil {
		result.Error = fmt.Sprintf("failed to generate thumbnail: %v", err)
		return result, err
	}
	result.ThumbnailPath = thumbnailPath

	// Получаем длительность видео
	duration, err := p.getVideoDuration(ctx, job.InputPath)
	if err != nil {
		result.Error = fmt.Sprintf("failed to get video duration: %v", err)
		return result, err
	}
	result.Duration = duration

	// Создаем HLS сегменты
	playlistPath := filepath.Join(outputDir, "index.m3u8")
	segmentPattern := filepath.Join(outputDir, "segment_%03d.ts")

	err = p.createHLSSegments(ctx, job.InputPath, playlistPath, segmentPattern, job.SegmentDuration)
	if err != nil {
		result.Error = fmt.Sprintf("failed to create HLS segments: %v", err)
		return result, err
	}

	// Получаем список созданных сегментов
	segments, err := p.getSegmentFiles(outputDir)
	if err != nil {
		result.Error = fmt.Sprintf("failed to get segment files: %v", err)
		return result, err
	}

	result.PlaylistPath = playlistPath
	result.SegmentPaths = segments
	result.Success = true

	return result, nil
}

// generateThumbnail создает thumbnail из видео
func (p *VideoProcessor) generateThumbnail(ctx context.Context, inputPath, outputPath string) error {
	cmd := exec.CommandContext(ctx, p.ffmpegPath,
		"-i", inputPath,
		"-ss", "00:00:01", // Берем кадр на 1 секунде
		"-vframes", "1",
		"-q:v", "2",
		"-y", // Перезаписываем файл
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg thumbnail failed: %v, output: %s", err, string(output))
	}

	return nil
}

// getVideoDuration получает длительность видео
func (p *VideoProcessor) getVideoDuration(ctx context.Context, inputPath string) (float64, error) {
	cmd := exec.CommandContext(ctx, p.ffmpegPath,
		"-i", inputPath,
		"-f", "null",
		"-",
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		// FFmpeg возвращает ошибку при получении информации, но выводит длительность
		outputStr := string(output)
		if strings.Contains(outputStr, "Duration:") {
			// Парсим длительность из вывода
			lines := strings.Split(outputStr, "\n")
			for _, line := range lines {
				if strings.Contains(line, "Duration:") {
					parts := strings.Fields(line)
					for i, part := range parts {
						if part == "Duration:" && i+1 < len(parts) {
							durationStr := strings.Trim(parts[i+1], ",")
							return parseDuration(durationStr)
						}
					}
				}
			}
		}
		return 0, fmt.Errorf("failed to get video duration: %v", err)
	}

	return 0, fmt.Errorf("no duration found in output")
}

// createHLSSegments создает HLS сегменты
func (p *VideoProcessor) createHLSSegments(ctx context.Context, inputPath, playlistPath, segmentPattern string, segmentDuration int) error {
	cmd := exec.CommandContext(ctx, p.ffmpegPath,
		"-i", inputPath,
		"-c:v", "libx264",
		"-c:a", "aac",
		"-hls_time", strconv.Itoa(segmentDuration),
		"-hls_playlist_type", "vod",
		"-hls_segment_filename", segmentPattern,
		"-y", // Перезаписываем файл
		playlistPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg HLS failed: %v, output: %s", err, string(output))
	}

	return nil
}

// getSegmentFiles получает список созданных сегментов
func (p *VideoProcessor) getSegmentFiles(outputDir string) ([]string, error) {
	files, err := filepath.Glob(filepath.Join(outputDir, "segment_*.ts"))
	if err != nil {
		return nil, err
	}

	return files, nil
}

// parseDuration парсит длительность в формате HH:MM:SS.mmm
func parseDuration(durationStr string) (float64, error) {
	parts := strings.Split(durationStr, ":")
	if len(parts) != 3 {
		return 0, fmt.Errorf("invalid duration format: %s", durationStr)
	}

	hours, err := strconv.ParseFloat(parts[0], 64)
	if err != nil {
		return 0, err
	}

	minutes, err := strconv.ParseFloat(parts[1], 64)
	if err != nil {
		return 0, err
	}

	seconds, err := strconv.ParseFloat(parts[2], 64)
	if err != nil {
		return 0, err
	}

	return hours*3600 + minutes*60 + seconds, nil
}

// ValidateFFmpeg проверяет доступность FFmpeg
func (p *VideoProcessor) ValidateFFmpeg() error {
	cmd := exec.Command(p.ffmpegPath, "-version")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg not available: %v", err)
	}

	if !strings.Contains(string(output), "ffmpeg version") {
		return fmt.Errorf("invalid ffmpeg installation")
	}

	return nil
}
