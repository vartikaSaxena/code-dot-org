require 'concurrent/scheduled_task'
require 'concurrent/utility/native_integer'
require 'honeybadger/ruby'

module Cdo
  # Abstract class to handle asynchronous-buffering and periodic-flushing using a thread pool.
  # This class is content-agnostic, buffering objects in memory through #buffer(object).
  # Subclasses implement #flush(objects), which will be called periodically as the buffer is flushed in batches.
  #
  # Because objects are stored in memory, the buffer can synchronously flush when the Ruby process exits.
  class Buffer
    MAX_INT = Concurrent::Utility::NativeInteger::MAX_VALUE

    attr_accessor :log

    # @param [Integer] batch_count    Maximum number of objects in a buffered batch.
    # @param [Integer] batch_size     Maximum total payload size in a buffered batch.
    # @param [Float] max_interval     Seconds after the first buffered item before a flush will occur.
    # @param [Float] min_interval     Seconds after the previous flush before a flush will occur.
    #                                 Useful for rate-throttling.
    # @param [Float] wait_at_exit     Seconds to wait at exit for flushing to complete.
    def initialize(
      batch_count:  MAX_INT,
      batch_size:   MAX_INT,
      max_interval: Float::INFINITY,
      min_interval: 0.0,
      wait_at_exit: nil,
      log: CDO.log
    )
      @batch_count = batch_count
      @batch_size   = batch_size
      @max_interval = max_interval
      @min_interval = min_interval
      @log = log

      @scheduled_flush = Concurrent::ScheduledTask.new(0.0) {}
      @buffer = []

      @ruby_pid = $$
      if wait_at_exit
        at_exit {flush!(wait_at_exit)}
      end
    end

    # Flush a batch of buffered objects.
    # Implement in subclass.
    # @param [Array<Object>] objects
    def flush(objects)
    end

    # Calculate the total size of a batch of objects.
    # Override in subclass when using 'batch_size' limit.
    # @param [Array<Object>] objects
    # @return [Numeric] size of objects
    def size(objects)
      1
    end

    # Add an object to the buffer.
    # @raise [ArgumentError] when the object exceeds batch size
    # @param [Object] object
    def buffer(object)
      reset_if_forked
      if (size = size([object])) > @batch_size
        raise ArgumentError, "Object size (#{size}) exceeds batch size (#{@batch_size})"
      end
      @buffer << BufferObject.new(object, now)
      schedule_flush
    end

    # Flush existing buffered objects.
    # @param [Float] timeout seconds to wait for buffered objects to finish flushing.
    def flush!(timeout = Float::INFINITY)
      reset_if_forked
      timeout_at = now + timeout
      until (wait = timeout_at - now) < 0 || @buffer.empty?
        @log.info "Flushing #{self.class}, waiting #{wait} seconds"
        schedule_flush(true)
        # Block until the pending flush is completed or timeout is reached.
        @scheduled_flush.wait(wait.infinite? ? nil : wait)
      end
    end

    private

    # Track time each object was added to the buffer.
    BufferObject = Struct.new(:object, :added_at)

    def now
      Concurrent.monotonic_time
    end

    # Schedule a flush in the future when the next batch is ready.
    # @param [Boolean] force flush batch even if not full.
    def schedule_flush(force = false)
      delay = batch_ready(force)
      if @scheduled_flush.pending?
        @scheduled_flush.reschedule(delay)
      else
        @scheduled_flush = Concurrent::ScheduledTask.execute(delay) do
          flush_batch
          schedule_flush unless @buffer.empty?
        end
      end
    end

    # Determine when the next batch of existing buffered objects will be ready to be flushed.
    # @param [Boolean] force flush batch even if not full.
    # @return [Float] Seconds until the next batch can be flushed.
    def batch_ready(force)
      return Float::INFINITY if @buffer.empty?

      # Wait until max_interval has passed since the earliest object to flush a non-full batch.
      earliest = @buffer.first.added_at
      wait = @max_interval - (now - earliest)

      # Flush now if the batch is full or when force flushing.
      wait = 0.0 if force ||
        size(@buffer.map(&:object)) >= @batch_size ||
        @buffer.length >= @batch_count

      # Wait until min_interval has passed since the last flush.
      min_delay = @min_interval - (now - @last_flush.to_f)

      [0.0, wait, min_delay].max.to_f
    end

    # Flush a batch of objects from the buffer.
    def flush_batch
      @last_flush = now
      flush(take_batch.map(&:object))
    rescue => e
      Honeybadger.notify(e)
      raise
    end

    # Take a single batch of objects from the buffer.
    def take_batch
      batch = []
      batch << @buffer.shift until
        @buffer.empty? ||
          batch.length >= @batch_count ||
          size((batch + [@buffer.first]).map(&:object)) > @batch_size
      batch
    end

    def reset_if_forked
      if $$ != @ruby_pid
        @buffer.clear
        @scheduled_flush.cancel
        @ruby_pid = $$
      end
    end
  end
end
