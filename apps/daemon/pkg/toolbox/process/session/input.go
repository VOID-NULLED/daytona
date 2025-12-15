// Copyright 2025 Daytona Platforms Inc.
// SPDX-License-Identifier: AGPL-3.0

package session

import (
	"net/http"

	"github.com/gin-gonic/gin"

	common_errors "github.com/daytonaio/common-go/pkg/errors"
)

// WriteInput godoc
//
//	@Summary		Write input to command
//	@Description	Write input data to a running command in a session for interactive execution
//	@Tags			process
//	@Accept			json
//	@Param			sessionId	path	string						true	"Session ID"
//	@Param			commandId	path	string						true	"Command ID"
//	@Param			request		body	SessionWriteInputRequest	true	"Input write request"
//	@Success		204
//	@Router			/process/session/{sessionId}/command/{commandId}/input [post]
//
//	@id				WriteInput
func (s *SessionController) WriteInput(c *gin.Context) {
	sessionId := c.Param("sessionId")
	commandId := c.Param("commandId")

	var request SessionWriteInputRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Error(common_errors.NewInvalidBodyRequestError(err))
		return
	}

	err := s.sessionService.WriteInput(sessionId, commandId, request.Input)
	if err != nil {
		c.Error(err)
		return
	}

	c.Status(http.StatusNoContent)
}
