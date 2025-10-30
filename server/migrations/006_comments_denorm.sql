-- Денормализованный счётчик комментариев для videos
-- 1) Добавляем колонку
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS comments INTEGER NOT NULL DEFAULT 0;

-- 2) Бэкофилл из существующих комментариев (учитываем только активные)
UPDATE videos v
SET comments = COALESCE(sub.cnt, 0)
FROM (
  SELECT video_id, COUNT(*)::int AS cnt
  FROM video_comments
  WHERE is_active = true
  GROUP BY video_id
) AS sub
WHERE v.id = sub.video_id;

-- 3) Функция-триггер для поддержки счётчика
CREATE OR REPLACE FUNCTION update_video_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_active IS DISTINCT FROM FALSE THEN
      UPDATE videos SET comments = comments + 1 WHERE id = NEW.video_id;
    END IF;
    RETURN NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Переключение активности
    IF (COALESCE(OLD.is_active, TRUE) = FALSE) AND (COALESCE(NEW.is_active, TRUE) = TRUE) THEN
      UPDATE videos SET comments = comments + 1 WHERE id = NEW.video_id;
    ELSIF (COALESCE(OLD.is_active, TRUE) = TRUE) AND (COALESCE(NEW.is_active, FALSE) = FALSE) THEN
      UPDATE videos SET comments = GREATEST(comments - 1, 0) WHERE id = NEW.video_id;
    END IF;
    RETURN NULL;
  ELSIF TG_OP = 'DELETE' THEN
    IF COALESCE(OLD.is_active, TRUE) = TRUE THEN
      UPDATE videos SET comments = GREATEST(comments - 1, 0) WHERE id = OLD.video_id;
    END IF;
    RETURN NULL;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4) Триггеры на вставку/обновление/удаление комментариев
DROP TRIGGER IF EXISTS trg_video_comments_insert ON video_comments;
CREATE TRIGGER trg_video_comments_insert
AFTER INSERT ON video_comments
FOR EACH ROW
EXECUTE FUNCTION update_video_comments_count();

DROP TRIGGER IF EXISTS trg_video_comments_update ON video_comments;
CREATE TRIGGER trg_video_comments_update
AFTER UPDATE OF is_active ON video_comments
FOR EACH ROW
EXECUTE FUNCTION update_video_comments_count();

DROP TRIGGER IF EXISTS trg_video_comments_delete ON video_comments;
CREATE TRIGGER trg_video_comments_delete
AFTER DELETE ON video_comments
FOR EACH ROW
EXECUTE FUNCTION update_video_comments_count();


